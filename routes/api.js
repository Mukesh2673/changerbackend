var express = require("express");
var router = express.Router();

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
router.get("/campaigns/:id", campaignController.show);
router.get("/campaigns", campaignController.index);

// VIDEO ROUTES
router.get("/videos/:id", videoController.show);
router.delete("/videos/:id", videoController.delete);
router.get("/videos", videoController.index);
router.get("/videos/likes/:vid/:uid", videoController.getVideoLikes);

router.post("/videos", videoController.store);
router.post("/videos/like/:vid/:uid", videoController.likeVideo);
router.post(
  "/hook/encoding-complete/:id?",
  videoController.encodingFinishedHook
);

router.post("/campaign/:id/donate/", campaignController.donate);

module.exports = router;
