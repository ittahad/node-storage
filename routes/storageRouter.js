var express = require('express');
var router = express.Router();
const responseWriter = require('../utility/res');
const cloudinary = require("../cloudinary");
const upload = require("../multer");
const SecurityContext = require('libidentity');
const FileSchema = require('../models/file');
var path = require('path')

const AppSettings = require(`../config.${process.env.NODE_ENV}`);
var config = new AppSettings();
const securityContext = new SecurityContext(config);

router.all('*', securityContext.verifyToken, securityContext.dbContextAccessor, securityContext.verifyUser)
  /**
   * A valid authorization token is mandatory for this endpoint. Upload file endpoint.
   * @route POST /storage/upload
   * @group Storage - storage endpoints
   * @consumes multipart/form-data
   * @param {file} file.formData.required
   * @param {string} type.formData.required
   * @returns {object} 200 - Upload file success info
   * @returns {Error}  default - Unexpected error
   * @security JWT
   */
    .post('/upload', upload.single("file"), async (req, res, next) => {
      try {
        console.log("/upload endpoint reached");
        let Files = securityContext.dataConnectionPool[req.tenantId].model('File', FileSchema);

        let originalName = req.file.originalname;
        let mimeType = path.extname(req.file.originalname);
        let size = req.file.size;

        if(req.body.type === null || req.body.type === undefined) {
          req.body.type = "raw";
        }

        const result = await cloudinary.uploader.upload(req.file.path, {use_filename :false, resource_type: req.body.type });

        if(result.public_id !== null && result.public_id !== 'undefined'){

          let storageId = result.public_id.split('.')[0];
          let fileEntry = new Files({
            name: originalName,
            sizeInBytes: size,
            type: mimeType,
            ownerId: req.userId,
            storageId: storageId,
            secureUrl: result.secure_url,
            url: result.url
          });
  
          fileEntry.save()
          .then((file) => {
            if(file === null) {  
              responseWriter.response(res, {success: false, 'response': { message: 'Failed to upload file', url: result.secure_url}}, null, 400);
            }
            
            return responseWriter.response(res, {success: true, 'response': { message: 'File uploaded', storageId: storageId, url: result.secure_url, sizeInBytes: size }}, null, 200);
          })
          .catch(err => next(err));
          
        }

      } catch (err) {
        let errMessage = (err.message !== null && err.message !== 'undefined') ? err.message : "Failed to upload";
        responseWriter.response(res, {success: false, 'message': errMessage }, null, 500);
      }
    })
  /**
   * A valid authorization token is mandatory for this endpoint
   * @route POST /storage/fetch
   * @group Storage - storage endpoints
   * @param {ImageId.model} imageId.body.required
   * @returns {object} 200 - Get file info
   * @returns {Error}  default - Unexpected error
   * @security JWT
   */
    .post('/fetch', async (req, res, next) => {
      try {
        console.log("/fetch endpoint reached");
        let Files = securityContext.dataConnectionPool[req.tenantId].model('File', FileSchema);
        let allRes = [];
        for(let idx = 0; idx < req.body.storageIds.length; idx++)
        {
          let response = await Files.findOne({storageId: req.body.storageIds[idx]})
          if(response === null) continue;
          allRes.push({ storageId: response.storageId, url: response.secureUrl, sizeInBytes: response.sizeInBytes});
        }
        responseWriter.response(res, {success: true, 'response': allRes }, null, 200);
      } catch (err) {
        let errMessage = (err.message !== null && err.message !== 'undefined') ? err.message : "Failed to upload";
        responseWriter.response(res, {success: false, 'message': errMessage }, null, 500);
      }
    });

/**
 * @typedef Image
 * @property {file} image.query.required - image file.
 */

/**
 * @typedef ImageId
 * @property {string[]} storageIds.query.required - image file ids.
 */

module.exports = router;
