const convertToStream = require('into-stream');
const { blobStorage } = require('./azure');
const { Errors: { SystemErrors: { MISSING_FILE_UPLOAD_PARAMETERS } } } = require('./mappings');
const { ErrorFactory } = require('./factories');

/**
 * Upload a file using the fileStream object
 * @param {String} pathPrefix pathPrefix to create virtual directories
 * @param {Object} file file object from form data, must have mimetype and buffer
 */
const fileUpload = async (pathPrefix, file) => {
  try {
    if (!pathPrefix || !file || !file.mimetype || !file.buffer) {
      const error = ErrorFactory.getError(MISSING_FILE_UPLOAD_PARAMETERS);
      throw error;
    }

    // create file name using random timestamp in directory of user
    const fileName = `${pathPrefix}/${new Date().getTime().toString()}`;

    // get mimeType of file and readable stream
    const fileType = file.mimetype;
    const fileStream = convertToStream(file.buffer);

    const fileUrl = await blobStorage.uploadFileStream(fileName, fileStream, fileType);
    return fileUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload multiple files
 * @param {String} pathPrefix pathPrefix to create virtual directories
 * @param {Array} files file object from form data, must have mimetype and buffer
 */
const multiFileUpload = async (pathPrefix, files = []) => {
  try {
    if (files.length === 0) {
      return [];
    }

    const uploadStatus = [];
    await Promise.all(files.map(async (file, index) => {
      try {
        const fileUrl = await fileUpload(pathPrefix, file);
        uploadStatus.push({
          originalname: file.originalname || 'Unknown',
          url: fileUrl,
          index,
          isFailed: false,
        });
      } catch (error) {
        uploadStatus.push({
          originalname: file.originalname || 'Unknown',
          url: null,
          index,
          isFailed: true,
        });
      }
    }));

    return uploadStatus;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fileUpload,
  multiFileUpload,
};
