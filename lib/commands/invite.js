const { getChats } = require('./../mtproto/methods');
const { inviteUsers, chatFilter, uniqArray} = require('./../methods');
const Question = require('telegram-api/types/Question');
const Message = require('telegram-api/types/Message');
const bot = require('./../resend_bot');

bot.command('invite', function(message) {
  
  invite(message).then(invite_count => {
    let users_count = new Message().html().text(invite_count.count).to(message.from.id);
    let user = new Message().text(invite_count.users.join('\n')).to(message.from.id);
    bot.send(users_count);
    bot.send(user);
  })
});

const invite = async(message) => {
  const chats = await getChats();
  var  filteredChats = chatFilter(chats);
  console.log('Choose from invite group'); /// to do 
  const selectFromInvite = new Question({
    text: 'Выберите группу из которой добавлять пользователей ',
    answers: fromChatTitles(filteredChats)
  });
  const selectedFromInvite = await bot.askKeyboardQuestion(selectFromInvite, message);
  const fromGroup = filteredChats.find(chat => chat.title === selectedFromInvite.text);
  console.log(fromGroup);  /// to do 
  console.log('Choose to invite group'); // to do 
  const selectToInvite = new Question({
    text: 'Выберите группу в которую добавлять пользователей',
    answers: toChatTitles(filteredChats, fromGroup)
  });
  
  const selectedToInvite = await bot.askKeyboardQuestion(selectToInvite, message).then(result => { 
    bot.send(new Message().text("\u{231B} Подождите идет добавление.").to(message.from.id));
    return result;
  });
  const toGroup = chats.find(chat => chat.title === selectedToInvite.text);
  console.log(toGroup); ///// to do
  return await inviteUsers(fromGroup, toGroup);
}

const fromChatTitles = function(chats) {
  return chats.map(chat => {
    return new Array(chat.title);
  });
}

const toChatTitles = function(chats, from_chat) {
  return chats.map(chat => {
    if(chat.id != from_chat.id)
      return new Array(chat.title);
    }).filter(function(chat) {
      return chat;
  });
}



module.exports = invite;

