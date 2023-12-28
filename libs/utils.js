const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const Buffer = require("buffer/").Buffer;
const path = require("path");
exports.randomInt = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.getFrom = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
exports.deleteFile = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

exports.thumbnailFile = async (file) => {
  try {
    const source = `uploads/${file.filename}`;
    let data = await new ffmpeg({ source: source, nolog: true })
      .takeScreenshots(
        { timemarks: ["00:00:01.000"], size: "1150x1400" },
        "thumbnail/"
      )
      .on("end", async function () {
        const imageFiles = fs.readdirSync("thumbnail/");
        const imageData = fs.readFileSync("thumbnail/" + imageFiles[0]);
        const base64 = Buffer.from(imageData).toString("base64");
        return base64;
      })
      .on("error", function () {
        deleteFile("uploads/");
        deleteFile("thumbnail");
        console.log("err is", error);
        return res.json({ error: error, status: 400 });
      });
  } catch (err) {
    console.log("erro is err", err);
  }
};
