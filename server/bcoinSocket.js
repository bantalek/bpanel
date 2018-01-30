const logger = require('./logger');

const socketHandler = nodeClient => {
  const subscriptions = {}; // cache to manage subscriptions made by clients
  return async socket => {
    // requests from client for messages to be broadcast to node
    socket.bind('broadcast', (event, ...args) => {
      /**
        // Example broadcast from client:
        socket.fire('broadcast', 'set filter', '00000000000000000000');
        // which will result in the following fire to bcoin server
        nodeClient.socket.fire('set filter', '00000000000000000000');
      **/
      logger.info(`Firing "${event}" to bcoin node`);
      nodeClient.call(event, ...args);
    });

    // requests from client to subscribe to events from node
    // client should indicate the event to listen for
    // and the `responseEvent` to fire when the event is heard
    socket.bind('subscribe', (event, responseEvent) => {
      // doing some caching of listeners
      if (!subscriptions[event]) {
        subscriptions[event] = [responseEvent]; // cache listener
      } else if (subscriptions[event].indexOf(responseEvent) === -1) {
        subscriptions[event].push(responseEvent);
      }

      logger.debug(`Subscribing to "${event}" event on bcoin node`);
      nodeClient.bind(event, (...data) => {
        logger.debug(
          `Event "${event}" received from node.`,
          `Firing "${responseEvent}" event`
        );
        socket.fire(responseEvent, ...data);
      });
    });

    nodeClient.socket.on('error', err => {
      logger.error('Socket error: ', err);
    });
  };
};

module.exports = socketHandler;