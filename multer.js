const multer = require("multer");
const path = require("path"); 

module.exports = multer({
  storage: multer.diskStorage({
    fileFilter: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      // if(ext !== '.jpg' && ext !== '.jepg' && ext !== '.png'){
      //   let err = new Error("File type is not supported");
      //   err.status = 400;
      //   cb(err, false);
      // }
      cb(null, true);
    },
    filename: function (req, file, callback) {
      let ext = path.extname(file.originalname);
      callback(null, Date.now() + "-" + file.originalname);
    }
  }), 
});