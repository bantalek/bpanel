'use strict';

const express = require('express');
const logger = require('./logger');

const routerWithClient = client => {
  const bcoinRouter = express.Router({ mergeParams: true });

  bcoinRouter.all('*', async (req, res, next) => {
    const { method, path, body } = req;
    try {
      logger.debug(
        `client: ${client.__proto__.constructor
          .name}, method: ${method}, path: ${path}`
      );
      const bcoinResponse = await client.request(method, path, body);
      logger.debug('server response:', bcoinResponse ? bcoinResponse : 'null');
      if (bcoinResponse) return res.status(200).json(bcoinResponse);
      // when bcoinResponse is null due to
      // resource not being found on server
      return res.status(404).json({ message: 'not found' });
    } catch (error) {
      logger.error('Error querying bcoin node:', error);
      return next(error);
    }
  });

  return bcoinRouter;
};

module.exports = routerWithClient;
