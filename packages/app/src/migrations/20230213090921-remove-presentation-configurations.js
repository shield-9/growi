// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:remove-presentation-configurations');

const mongoose = require('mongoose');

module.exports = {
  async up() {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    await Config.findOneAndDelete({ key: 'markdown:presentation:pageBreakSeparator' });
    await Config.findOneAndDelete({ key: 'markdown:presentation:pageBreakCustomSeparator' });

    logger.info('Migration has successfully applied');
  },

  async down() {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const insertConfig = new Config({
      ns: 'crowi',
      key: 'markdown:presentation:pageBreakSeparator',
      value: 2,
    });

    await insertConfig.save();

    logger.info('Migration has been successfully rollbacked');
  },
};
