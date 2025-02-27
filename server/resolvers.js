const db = require('./db');
const { PubSub } = require('graphql-subscriptions');

const pubSub = new PubSub();

const MESSAGE_ADDED = 'MESSAGE_ADDED';

function requireAuth(userId) {
  if (!userId) {
    throw new Error('Unauthorized');
  }
}

const Query = {
  messages: (_root, _args, {userId}) => {
    requireAuth(userId);
    return db.messages.list();
  }
}

const Mutation = {
  addMessage: (_root, {input}, {userId}) => {
    requireAuth(userId);
    const messageId = db.messages.create({from: userId, text: input.text});
    const message = db.messages.get(messageId);
    pubSub.publish(MESSAGE_ADDED, {messageAdded: message});
    return db.messages.get(messageId);
  }
};

const Subscription = {
  messageAdded: {
    subscribe: () => pubSub.asyncIterator(MESSAGE_ADDED)
  }
};

module.exports = { Query, Mutation, Subscription };
