const fs = require('fs');
const path = require("path");
exports.randomInt = (min = 0, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getFrom = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};
exports.deleteFile=(directory)=>{
 fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
}
