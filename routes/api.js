var express = require("express");
var router = express.Router();
const cron = require('node-cron');
const upload = require('../libs/multerConfig')
const auth = require("../middleware/firebaseAuth").authCheck;
const { validateToken } = require("../middleware/auth");
const {
  validateSigninRequest,
  validateAdvocate,
  validateSignupRequest,
  validateSignupConfirmRequest,
  validateSignPetitions,
  validateBookMarks,
  validateCampaignImpact
}=require('../middleware/validations');
const userController = require("../controllers/userController");
const campaignController = require("../controllers/campaignController");
const videoController = require("../controllers/videoController");
const issueController = require("../controllers/issueController");
const searchController=require("../controllers/searchController")
const hashtagsController=require("../controllers/hashtagController")
const adVocateController=require("../controllers/advocacyController")
const authController =require("../controllers/authController")
const bookMarkController=require("../controllers/bookMarksController")
cron.schedule('0 0 * * *',  issueController.deleteOldIssues);

// USER ROUTES
router.get("/users", userController.users)
router.get("/users/:id", userController.getUser);
router.get("/users/uid/:uid", userController.getUserByUID);
router.get("/users/following/:cuid/:fuid", userController.getFollowingVideos);
router.post("/users",validateToken, userController.createUser);
router.post("/users/follow/:cuid/:fuid", userController.followUser);
router.post("/users/unfollow/:cuid/:fuid", userController.unFollowUser);
router.post("/users/update/:id", userController.editProfile);
router.patch("/user/cause", userController.cause)
router.get("/users/cognito/:cuid", userController.getUserByCognito)
router.delete("/users/:uid", userController.delete)
router.post("/user/privacy", userController.privacy)
router.post("/user/language", userController.language)
router.post("/user/report", userController.report)
router.post("/user/profile/remove/:id", userController.removeProfileImage)
router.post("/signin", validateSigninRequest, authController.signin)
router.post("/signup", validateSignupRequest, authController.signup)
router.post("/signupConfirm", validateSignupConfirmRequest, authController.signupConfirm)
router.get("/user/notification/:id",userController.notification)
router.post(
  "/upload/profile",
  upload.single("Image"),
  videoController.uploadProfile
);
// Messages
router.post("/user/message", userController.message)
router.get("/user/message/:pid/:uid",userController.getMessages)
router.get("/user/messages", validateToken, userController.messages)


// CAMPAIGN ROUTES
router.get("/campaigns", campaignController.showCampaigns);
router.get("/campaigns/:id", campaignController.showCampaign);
router.post("/campaign/donation/:id/donate", validateToken, campaignController.donate);
router.post("/campaign/report",validateToken, campaignController.report)

//apply for particiapation to the campaign participate
router.post("/campaign/:campaignId/participate/:participationId",validateToken, campaignController.participateInCampaign);
router.post("/campaigns", campaignController.create);
router.post("/campaign/message", validateToken,campaignController.postMessages)
router.get("/campaign/:id/message", validateToken,campaignController.getMessages)
router.post("/campaign/:campaignId/impactVideos",  upload.single("video"), validateToken, validateCampaignImpact, campaignController.campaignImpactVideos)
//get Volunteers add condition to get  volunteers on map
router.get("/campaign/volunteers", campaignController.volunteers)
// get campaing that you have voluteer
router.get("/volunteeringForYou", validateToken, campaignController.userVolunteersCompaign);
router.post("/uploadImage", upload.single("Image"), videoController.uploadImages);
router.post("/signPetition", validateToken, validateSignPetitions, campaignController.signPetitions)


// VIDEO ROUTES
router.get("/videos/:id", videoController.show);
router.delete("/videos/:id", videoController.delete);
router.get("/videos", videoController.index);
router.post("/video/location", videoController.location)
router.post("/thumbnail", upload.single("video"), videoController.thumbnail);
router.post("/upload", upload.single("video"), videoController.upload);
router.get("/videos/likes/:vid/:uid", videoController.getVideoLikes);
router.post("/videos", videoController.store);
router.post("/videos/like/:vid/:uid", videoController.likeVideo);
router.post("/video/comment", videoController.commentVideo);
router.post("/video/comment/like", videoController.commentLikes);
router.post("/video/comment/reply/like", videoController.replyCommentLikes);
router.post("/video/comment/reply", videoController.replyCommentVideo);


//issue Routes
router.post("/issue", issueController.create);
router.get("/issue", issueController.index);
router.post("/issue/location", issueController.location);
router.post("/issue/generate", issueController.generate);
router.post("/issue/upvotes", issueController.upvotes)
router.get("/user/issue/:uid", issueController.userIssues);
router.post("/issue/join", issueController.joinIssue)
router.post("/issue/leave", issueController.leaveIssue)
router.get("/issue/:id", issueController.issueDetails)
router.patch("/issue/:id", issueController.update)
router.delete("/issue/:id", issueController.deleteIssue)
router.post("/issue/message", issueController.messages)
router.post("/issue/report", issueController.report)
router.post("/issue/share", issueController.share)
router.post("/issue/:id/views", issueController.views)
router.post("/issue/deleteOld", issueController.deleteOldIssues)

//impact Routes
// router.post("/impact", impactController.create);
// router.get("/impact", impactController.index);

//search
router.get("/search", searchController.search)

//hasTags
router.post("/hashtags", hashtagsController.add)
router.get("/content/hashtags/:tag", hashtagsController.getContent)

//advocate Routes
router.post("/advocate", validateToken, upload.single("video"),validateAdvocate,adVocateController.add)
router.delete("/advocate/:id", validateToken, adVocateController.delete)
router.get("/advocate", adVocateController.get)

//bookmarks 
router.post("/bookmarks", validateToken, validateBookMarks,bookMarkController.add)
router.delete("/bookmarks/:id",validateToken, bookMarkController.delete);
router.get("/bookmarks",validateToken, bookMarkController.get);

module.exports = router;
