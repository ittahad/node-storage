
var AppSettings = require(`./config.${process.env.NODE_ENV}`);

const cloudinaryConfig = new AppSettings();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudinary.CLOUD_NAME,
  api_key: cloudinaryConfig.cloudinary.API_KEY,
  api_secret: cloudinaryConfig.cloudinary.API_SECRET,
}); 
module.exports = cloudinary;