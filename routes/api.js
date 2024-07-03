var express = require("express");
var router = express.Router();
const cron = require('node-cron');
const upload = require('../libs/multerConfig')
const { validateToken} = require("../middleware/auth");
const {
  validateSigninRequest,
  validateAdvocate,
  validateSignupRequest,
  validateSignupConfirmRequest,
  validateSignPetitions,
  validateBookMarks,
  validateCampaignImpact,
  ValidateCampaign
}=require('../middleware/validations');
const userController = require("../controllers/userController");
const campaignController = require("../controllers/campaignController");
const videoController = require("../controllers/videoController");
const issueController = require("../controllers/issueController");
const searchController = require("../controllers/searchController")
const hashtagsController = require("../controllers/hashtagController")
const adVocateController = require("../controllers/advocacyController")
const authController = require("../controllers/authController")
const bookMarkController = require("../controllers/bookMarksController")
const skillController = require("../controllers/skillController") 
cron.schedule('0 0 * * *',  issueController.deleteOldIssues);

//cognito Routes
router.post("/signin", validateSigninRequest, authController.signin)
router.post("/signup", validateSignupRequest, authController.signup)
router.post("/signupConfirm", validateSignupConfirmRequest, authController.signupConfirm)

// USER ROUTES
router.get("/users", userController.users)
router.get("/users/:id", userController.getUser);
router.get("/users/uid/:uid", userController.getUserByUID);
router.get("/users/following/:cuid/:fuid", userController.getFollowingVideos);
router.post("/users/follow/:cuid/:fuid", userController.followUser);
router.post("/users/unfollow/:cuid/:fuid", userController.unFollowUser);
router.post("/users/update",validateToken,  userController.editProfile);
router.get("/user/admin", validateToken, userController.createAdmin )
router.get("/users/cognito/:cuid", userController.getUserByCognito)
router.post("/user/report", userController.report)
router.post("/user/profile/remove", validateToken, userController.removeProfileImage)
router.get("/user/notification/:id", userController.notification)
router.post("/user/profile/upload",validateToken, upload.single("Image"), userController.uploadProfile);

//onboarding route
router.post("/user/onboarding", userController.saveUserRecords);
router.patch("/user/cause",validateToken, userController.cause)


//Settings Routes
router.patch("/user/privacy", validateToken, userController.privacy)
router.patch("/user/language", validateToken, userController.language)
router.delete("/user/:cid", validateToken, userController.delete)


//Skills Routes
router.get("/skills", skillController.skills)
router.delete("/skill/:id", validateToken, skillController.removeUserSkill)
router.post("/skills/add", validateToken, skillController.add)
router.patch("/skill/:id/verify", validateToken, skillController.verifySkill)

// Messages
router.post("/user/message", userController.message)
router.get("/user/message/:pid/:uid",userController.getMessages)
router.get("/user/messages", validateToken, userController.messages)

// CAMPAIGN ROUTES
router.post("/campaigns",validateToken, ValidateCampaign, campaignController.create);
router.get("/campaigns", campaignController.showCampaigns);
router.get("/campaigns/trending", campaignController.trendingCampaigns )
router.get("/campaigns/forUser", validateToken, campaignController.campaignForUser)
router.get("/campaigns/:id", campaignController.showCampaign);
router.post("/campaign/donation/:id/donate", validateToken, campaignController.donate);
router.post("/campaign/report",validateToken, campaignController.report)
router.post("/campaign/message", validateToken, campaignController.postMessages)
router.get("/campaign/:id/message", validateToken,campaignController.getMessages)
router.post("/campaign/:campaignId/impactVideo",  upload.single("video"), validateToken, validateCampaignImpact, campaignController.campaignImpactVideos)
router.post("/campaign/:campaignId/volunteering/:volunteeringId",validateToken, campaignController.applyForVolunteers);
router.post("/campaign/:campaignId/volunteers/:volunteerId/approve", validateToken, campaignController.approveVolunteers )
router.get("/campaign/volunteers", campaignController.volunteers)//get Volunteers based Location
router.get("/campaign/volunteering/forUser", validateToken, campaignController.volunteeringForUser); //get campaing that you have voluteer
router.post("/campaign/signPetition", validateToken, validateSignPetitions, campaignController.signPetitions)
router.get("/campaign/volunteering/participation/history", validateToken, campaignController.volunteerParticipationHistory)

// VIDEO ROUTES
router.get("/video/:id", videoController.show);
router.post("/uploadImage", upload.single("Image"), videoController.uploadImages);
router.delete("/video/:id", videoController.delete);
router.get("/videos", videoController.getVideos);
router.post("/thumbnail", upload.single("video"), videoController.thumbnail);
router.post("/video/upload",validateToken, upload.single("video"), videoController.upload);
router.get("/videos/likes/:vid/:uid", videoController.getVideoLikes);
router.post("/videos", videoController.store);
router.post("/video/:vid/comment",validateToken, videoController.commentVideo);
router.post("/video/:vid/like",validateToken, videoController.likeVideo);
router.post("/video/:vid/comment/:cid/like", validateToken, videoController.commentLikes);
router.post("/video/:vid/comment/:cid/reply", validateToken, videoController.replyCommentVideo);
router.post("/video/:vid/comment/reply/:repliesCommentId/like", validateToken, videoController.replyCommentLikes);
router.patch("/video/:vid/watch", videoController.addViews)
router.get("/friends/impact", validateToken, videoController.friendsImpact);

//issue Routes
router.post("/issue", validateToken, issueController.create);
router.get("/issue", issueController.index);
router.post("/issue/location", issueController.location);
router.post("/issue/generate", issueController.generate);
router.post("/issue/upvotes", validateToken, issueController.upvotes)
router.get("/issue/forUser", validateToken, issueController.issueForUser);
router.post("/issue/join", validateToken, issueController.joinIssue)
router.post("/issue/leave", validateToken, issueController.leaveIssue)
router.get("/issue/:id", issueController.issueDetails)
router.patch("/issue/:id", validateToken, issueController.update)
router.delete("/issue/:id", validateToken, issueController.deleteIssue)
router.post("/issue/message",validateToken, issueController.messages)
router.post("/issue/report", validateToken, issueController.report)
router.post("/issue/share", validateToken, issueController.share)
router.post("/issue/:id/views",validateToken, issueController.views)
router.post("/issue/deleteOld", issueController.deleteOldIssues)

//search
router.get("/search", searchController.search)

//hashtags
router.post("/hashtags", hashtagsController.add)
router.get("/content/hashtags/:tag", hashtagsController.getContent)

//advocate Routes
router.post("/advocate", validateToken, upload.single("video"),validateAdvocate,adVocateController.add)
router.delete("/advocate/:id", validateToken, adVocateController.delete)
router.get("/advocate", validateToken, adVocateController.get)

//bookmarks 
router.post("/bookmarks", validateToken, validateBookMarks,bookMarkController.add)
router.delete("/bookmarks/:id",validateToken, bookMarkController.delete);
router.get("/bookmarks",validateToken, bookMarkController.get);

module.exports = router;
