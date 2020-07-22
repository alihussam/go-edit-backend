const Promise = require('bluebird');
const path = require('path');
const router = require('express').Router();
const fs = require('fs');
const debug = require('debug')('node-server:src/routes');
const { MODULE_CONFIGURATION: { deauth, unmount } } = require('./config');
const { authenticate } = require('./middlewares');

const fsp = Promise.promisifyAll(fs);

/**
 * Read module dir and mount routes of all present modules in it
 * if a module name in present in unmount, its routes are not mounted
 * if a module name is present in dauth, its routes are not authenticated
 * See src/config/index.js
 */
(async () => {
  const useModules = await fsp.readdirAsync('./src/modules');
  useModules.forEach((m) => {
    try {
      if (!unmount.includes(m)) {
        const module = require(`./modules/${m}/${m}.routes`);
        if (deauth.includes(m)) {
          router.use(`/${m}`, module);
          debug(`${m} Mounted, Authentication: Disabled`);
        } else {
          router.use(`/${m}`, authenticate, module);
          debug(`${m} is Mounted, Authentication: Enabled`);
        }
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        debug(`No route file found for module ${m}, consider unmounting it`);
      } else {
        throw error;
      }
    }
  });
})();

module.exports = router;