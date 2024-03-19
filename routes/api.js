var express = require("express");
var router = express.Router();
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
const auth = require("../middleware/firebaseAuth").authCheck;
const { validateToken } = require("../middleware/auth");

const userController = require("../controllers/userController");
const campaignController = require("../controllers/campaignController");
const videoController = require("../controllers/videoController");
const issueController = require("../controllers/issueController");
const impactController = require("../controllers/impactController");
const searchController=require("../controllers/searchController")
const hashtagsController=require("../controllers/hashtagController")
// USER ROUTES
router.get("/users",userController.users)
router.get("/users/:id", userController.getUser);
router.get("/users/uid/:uid", userController.getUserByUID);
router.get("/users/following/:cuid/:fuid", userController.getFollowingVideos);
router.post("/users",validateToken, userController.createUser);
router.post("/users/follow/:cuid/:fuid", userController.followUser);
router.post("/users/unfollow/:cuid/:fuid", userController.unFollowUser);
router.post("/users/update/:id", userController.editProfile);
router.patch("/user/cause",userController.cause)
router.get("/users/cognito/:cuid",userController.getUserByCognito)
router.delete("/users/:uid",userController.delete)
router.post("/user/privacy",userController.privacy)
router.post("/user/language",userController.language)
router.post("/user/report",userController.report)
router.post(
  "/upload/profile",
  upload.single("Image"),
  videoController.uploadProfile
);

// CAMPAIGN ROUTES
router.get("/campaigns", campaignController.index);
router.get("/campaigns/:id", campaignController.show);
router.post("/campaign/:id/donate/", campaignController.donate);
router.post("/campaign/:id/participate/", campaignController.participant);
router.post("/campaigns", campaignController.create);
router.post("/donate", campaignController.donateToCampaign);
router.post("/paymentsession", campaignController.paymentSession);
router.post(
  "/uploadImage",
  upload.single("Image"),
  videoController.uploadImages
);
// VIDEO ROUTES
router.get("/videos/:id", videoController.show);
router.delete("/videos/:id", videoController.delete);
router.get("/videos", videoController.index);
router.post("/video/location",videoController.location)
router.post("/thumbnail", upload.single("video"), videoController.thumbnail);
router.post("/upload", upload.single("video"), videoController.upload);
router.get("/videos/likes/:vid/:uid", videoController.getVideoLikes);

router.post("/videos", videoController.store);
router.post("/videos/like/:vid/:uid", videoController.likeVideo);
router.post(
  "/hook/encoding-complete/:id?",
  videoController.encodingFinishedHook
);
//issue Routes
router.post("/issue", issueController.create);
router.get("/issue", issueController.index);
router.post("/issue/location",issueController.location);
router.post("/issue/generate",issueController.generate);
router.post("/issue/upvotes",issueController.upvotes)
router.get("/user/issue/:uid", issueController.userIssues);
router.post("/issue/join",issueController.joinIssue)
router.post("/issue/leave",issueController.leaveIssue)
router.get("/issue/:id",issueController.issueDetails)
router.patch("/issue/:id",issueController.update)
router.delete("/issue/:id",issueController.deleteIssue)
router.post("/issue/message",issueController.messages)


//impact Routes
router.post("/impact", impactController.create);
router.get("/impact", impactController.index);

//search
router.get("/search",searchController.search)

//hasTags
router.post("/hashtags",hashtagsController.add)


module.exports = router;
