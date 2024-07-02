const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const path = "uploads/";
      fs.mkdirSync(path, { recursive: true });
      return cb(null, path);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
const upload = multer({ storage: storage });
module.exports = upload;

