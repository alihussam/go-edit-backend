// BlobServiceClient: allows you to manipulate Azure Storage resources and blob containers.
// ContainerClient: allows you to manipulate Azure Storage containers and their blobs.
// BlobClient: allows you to manipulate Azure Storage blobs.
const { BlobServiceClient, ContainerClient, BlobClient } = require('@azure/storage-blob');
const debug = require('debug')('node-server:src/libraries/azure/blobStorage.azure');

const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

/**
 * Configure blob storage library to upload files
 * @param {Object} config configuration object
 * @param {String} config.STORAGE_CONNECTION_STRING blob storage connection string
 * @param {String} config.STORAGE_CONTAINER_NAME blob storage container to use
 */
module.exports = (config) => {
  try {
    const { STORAGE_CONNECTION_STRING, STORAGE_CONTAINER_NAME } = config;

    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER_NAME);

    /**
         * Upload a file using node readable streams
         * @param {String} fileName fileName
         * @param {Stream} fileStream readable stream
         * @param {String} contentType content type of file for headers
         */
    const uploadFileStream = async (fileName, fileStream, contentType) => {
      try {
        // Create the container if it not exists
        const createContainerResponse = await containerClient.createIfNotExists({ access: 'blob' });
        debug(`[AZURE_BLOB_STORAGE] Container created successfully. requestId: ${createContainerResponse.requestId}`);

        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        const uploadBlobResponse = await blockBlobClient.uploadStream(
          fileStream, uploadOptions.bufferSize, uploadOptions.maxBuffers, {
            blobHTTPHeaders: { blobContentType: contentType },
          },
        );
        debug(`[AZURE_BLOB_STORAGE] File upload success. requestId: ${uploadBlobResponse.requestId}`);

        return blockBlobClient.url;
      } catch (error) {
        throw new Error('[AZURE_BLOB_STORAGE] error uploading file', error);
      }
    };

    return {
      uploadFileStream,
    };
  } catch (error) {
    throw new Error('[AZURE_BLOB_STORAGE] error configuring blob storage', error);
  }
};
