const {
  AZURE: {
    AZURE_STORAGE_CONNECTION_STRING,
    AZURE_STORAGE_CONTAINER_NAME,
  },
} = require('../../config');

const blobStorage = require('./blobStorage.azure')({
  STORAGE_CONNECTION_STRING: AZURE_STORAGE_CONNECTION_STRING,
  STORAGE_CONTAINER_NAME: AZURE_STORAGE_CONTAINER_NAME,
});

// Return Azure library as a single object
module.exports = {
  // configure blob storage
  blobStorage,
};
