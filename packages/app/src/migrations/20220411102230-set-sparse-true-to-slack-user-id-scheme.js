import { getModelSafely, getMongoUri, mongoOptions } from '@growi/core';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:drop-pages-indices');

/**
 * set sparce true to slackMemberId
 */
module.exports = {
  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);
    const User = getModelSafely('User') || require('~/server/models/user')();

    await User.updateMany(
      {},
      { $set: { slackMemberId: { sparse: true } } },
      // { upsert: true, new: true },
    );

    logger.info('Migration has successfully applied');
  },

  down(db) {
    // do not rollback
  },
};
