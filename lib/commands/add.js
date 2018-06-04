const { getChats } = require('./../mtproto/methods');
const { Publisher } = require('./../storage');
const Question = require('telegram-api/types/Question');
const Message = require('telegram-api/types/Message');

const { chatFilter, uniqArray } = require('./../methods');
const bot = require('./../resend_bot');

bot.command('add', message => {
  var notice = new Message().html().text("<b>Для пересылки сообщений бот должен быть добавлен в оба чата!!!\u{26A0} </b>").to(message.from.id);
  bot.send(notice);
  add(message).then(publisher => {
    let answer = new Message().text('Все готово \u{2714}').to(message.from.id);
    bot.send(answer);
  })
});

const add = async(message) => {
  const chats = await getChats();
  let newPublisher = new Publisher();
  let pubChats = pubChatTitles(chats);
  const selectPub = new Question({
    text: 'Выберите группу из которой хотить получать сообщения',
    answers: pubChats
  });

  const selectedPub = await bot.askKeyboardQuestion(selectPub, message);
  const from_chat = chats.find(chat => chat.title === selectedPub.text);

  newPublisher.from_chat = from_chat.id;
  newPublisher.from_chat_type = from_chat._;

  let subChats = subChatTitles(chats, from_chat);
  const selectSub = new Question({
    text: 'Теперь вам нужно выбрать группу куда будет приходить сообщения',
    answers: subChats
  });

  const selectedSub = await bot.askKeyboardQuestion(selectSub, message);
  const to_chat = chats.find(chat => chat.title === selectedSub.text);

  newPublisher.to_chat = to_chat.id;
  newPublisher.to_chat_type = to_chat._;

  return await newPublisher.save();
}

const pubChatTitles = function(chats) {
  return chatFilter(chats).map(chat => {
    return new Array(chat.title);
  });
}

const subChatTitles = function(chats, from_chat) {
  return chatFilter(chats).map(chat => {
    if(chat.id != from_chat.id)  
      return new Array(chat.title);
  }).filter(function(chat) {
    return chat;
  });
}

module.exports = add; 