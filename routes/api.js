var express = require("express");
var router = express.Router();
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path="uploads/"
    fs.mkdirSync(path, { recursive: true })
    return cb(null, path)

  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
const auth = require("../middleware/firebaseAuth").authCheck;

const userController = require("../controllers/userController");
const campaignController = require("../controllers/campaignController");
const videoController = require("../controllers/videoController");

// USER ROUTES
router.get("/users/:id", userController.getUser);
router.get("/users/uid/:uid", userController.getUserByUID);
router.get("/users/following/:cuid/:fuid", userController.getFollowingVideos);
router.post("/users", userController.createUser);
router.post("/users/follow/:cuid/:fuid", userController.followUser);
router.post("/users/unfollow/:cuid/:fuid", userController.unFollowUser);
router.post("/users/update/:id", userController.editProfile);

// CAMPAIGN ROUTES
router.get("/campaigns", campaignController.index);
router.get("/campaigns/:id", campaignController.show);
router.post("/campaign/:id/donate/", campaignController.donate);
router.post("/campaign/:id/participate/", campaignController.participant);
router.post("/campaigns",campaignController.create)



// VIDEO ROUTES
router.get("/videos/:id", videoController.show);
router.delete("/videos/:id", videoController.delete);
router.get("/videos", videoController.index);
router.post("/thumbnail", upload.single("video"), videoController.thumbnail);
router.post("/upload", upload.single("video"), videoController.upload);
router.get("/videos/likes/:vid/:uid", videoController.getVideoLikes);

router.post("/videos", videoController.store);
router.post("/videos/like/:vid/:uid", videoController.likeVideo);
router.post(
  "/hook/encoding-complete/:id?",
  videoController.encodingFinishedHook
);

module.exports = router;
