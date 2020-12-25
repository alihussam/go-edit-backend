const multer = require('multer');

/**
 * File upload parser middleware
 * @param {String} fieldName custom filed name to process in form data for file,
 * by default field name is 'file'
 * @param {Boolean} isSingleFile if the file being upload is single file or array of file,
 * defaults to true
 */
module.exports = (fieldName = 'file', isSingleFile = true) => {
  if (isSingleFile) {
    return multer({ storage: multer.memoryStorage() })
      .single(fieldName);
  }
  return multer({ storage: multer.memoryStorage() })
    .array(fieldName, 20);
};
