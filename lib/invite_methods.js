const { getFullChat, addChatUser, getParticipants, inviteToChannel } = require('./mtproto/methods');
const { isMegaGroup, isGroup } = require('./utils');
const { inviteLog, History } = require('./storage/index');
const inviteFactory = require('./invite_factory');

const inviteCount = function(users) {
	let limit = 300
	var inviteSize = users.length < limit ? users.length : limit;
	return inviteSize 
};

const resultFormater = function( fail, success, invitedUsers, all_users) {
	return result = {
		count: `\u{2714} <b> Пользователей добавлено: </b> ${success} \n\u{2716} <b> Пользователей не добавлено: </b> ${fail} <b> всего 200 пользователей`,
		users: invitedUsers
	};
};

Array.prototype.eachSlice = function (size){
  this.arr = [];
  for (let i = 0, l = this.length; i < l; i += size){
    this.arr.push(this.slice(i, i + size))
  }
  return this.arr
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const inviteToGroup = async(from, to, users, inviteLogProperties) => {
	let invitedUsers = ["ДОбавление пользователи :"];
	var i = fail = success = 0;
	while (i < inviteCount(users)) {
    try {
      let inviteFac = new inviteFactory(to, users[i]);
      await inviteFac.toGroup();
      invitedUsers.push(users[i].first_name + ' ' + users[i].last_name);
      success++;
    } catch(e) {
      console.log(e.message)
      fail++;
    }
    await inviteLog.updateOne(inviteLogProperties, { $inc: {"invited_count": 1 } }, {upsert: true, new: true});
    console.log(i);
    i++;
  }
  return await resultFormater(fail, success, invitedUsers);
}

const inviteToSuperGroup = async(from, to, users, inviteLogProperties) => {
	let invitedUsers = ["Добавление пользователи :"];
	var i = fail = success = 0;
  console.log(users.length);
	let inputUsers = [];
    while(i < inviteCount(users)) {
      let inputUser = {
        _: 'inputUser',
        user_id: users[i].id,
        access_hash: users[i].access_hash
      };
      inputUsers.push(inputUser);
      i++;
    }
    console.log(inputUsers.length);
    i = 0;
    fail = inputUsers.length
    inputUsers = inputUsers.eachSlice(5);
    console.log(inputUsers.length);
    while(i < inputUsers.length) {
	    let inviteFac = new inviteFactory(to, inputUsers[i]);
	    try {
        console.log('hey ' + i );
        await sleep(10000);
        let inv_users = await inviteFac.toMegaGroup();
        success += inv_users.users.length
        console.log(inv_users);
        var y = 0;
  	     	while(y < inv_users.users.length) {
            invitedUsers.push(namePusher(inv_users.users[y]));
            y++;
          }
	    } catch(e) {
	      console.log(e.message);
	    }
      i++;
	  }
    fail = fail - (invitedUsers.length - 1);
     await inviteLog.updateOne(inviteLogProperties, { $inc: {"invited_count": ( inputUsers.length * 4  ) } }, {upsert: true, new: true});
    if(success != 0 )
      History.create({ inviteCount: success, from_chat_name: from.title , to_chat_name: to.title });
  return await resultFormater(fail, success , invitedUsers);
}

const namePusher = function(name) {
  if (name.last_name != undefined) {
    return name.first_name + ' ' + name.last_name;
  }
};

module.exports = {
  inviteToSuperGroup,
  inviteToGroup
};