const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let filename = Date.now() + file.originalname.replace(/\s/g, "");
    cb(null, filename);
  },
});

var upload = multer({ storage: storage });
module.exports = upload;
