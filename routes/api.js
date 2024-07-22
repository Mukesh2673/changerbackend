var express = require("express");
var router = express.Router();
const cron = require('node-cron');
const upload = require('../libs/multerConfig')
const { validateToken, accessToken,cognitoUserDetails,userInfoToken} = require("../middleware/auth");
const { validation }=require('../middleware/validations');
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
router.post("/signin", validation.validateSigninRequest, authController.signin)
router.post("/signup", validation.validateSignupRequest, authController.signup)
router.post("/signupConfirm", validation.validateSignupConfirmRequest, authController.signupConfirm)
router.get("/accessToken" ,accessToken)
router.get("/cognitoUser", cognitoUserDetails)

// USER ROUTES
router.get("/users", userController.users)
router.get("/users/:id", userController.getUser);
// router.get("/users/uid/:uid", userController.getUserByUID);
// router.get("/users/following/:cuid/:fuid", userController.getFollowingUser);
router.post("/users/:id/follow", validateToken, userController.followUser);
router.post("/users/:id/unfollow", validateToken, userController.unFollowUser);
router.post("/users/update",validateToken,  upload.single("Image"),userController.editProfile);
router.get("/user/admin", validateToken, userController.createAdmin )
router.get("/users/cognito/:cuid", userController.getUserByCognito)
router.post("/user/report", validateToken, validation.validateReport, userController.report)
router.post("/user/profile/remove", validateToken, userController.removeProfileImage)
router.get("/user/notification",validateToken,  userController.notification)
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
router.post("/user/message", validateToken, userController.message)
router.get("/user/:id/message", validateToken,  userController.getMessages)
router.get("/user/messages", validateToken, userController.messages)

// CAMPAIGN ROUTES
router.post("/campaigns",validateToken, validation.ValidateCampaign, campaignController.create);
router.post("/campaign/donation/:donationId/donate", validateToken, validation.validateDonation,campaignController.donate);
router.post("/campaign/report",validateToken, validation.validateReport, campaignController.report)
router.post("/campaign/:campaignId/message", validateToken, validation.validateCampaignMessages, campaignController.postMessages)
router.post("/campaign/:campaignId/impactVideo", validateToken, upload.single("video"), validation.validateCampaignImpact, campaignController.campaignImpactVideos)
router.post("/campaign/:campaignId/volunteering/:volunteeringId",validateToken, validation.validateVolunteering, campaignController.applyForVolunteers);
router.post("/campaign/:campaignId/volunteers/:volunteerId/approve", validateToken, validation.validateVolunteering, campaignController.approveVolunteers )
router.post("/campaign/signPetition", validateToken, validation.validateSignPetitions, campaignController.signPetitions)
router.post("/campaign/:campaignId/share", validateToken, validation.validateCampaignId,  campaignController.shareCampaign)
router.get("/campaigns", campaignController.showCampaigns);
router.get("/campaigns/trending", campaignController.trendingCampaigns )
router.get("/campaigns/forUser", validateToken, campaignController.campaignForUser)
router.get("/campaigns/:campaignId",userInfoToken, validation.validateCampaignId, campaignController.showCampaign);
router.get("/campaign/:id/message", validateToken, validation.validateCampaignId,campaignController.getMessages)
router.get("/campaign/volunteers", campaignController.volunteers)//get Volunteers based Location
router.get("/campaign/volunteering/forUser", validateToken, campaignController.volunteeringForUser); //get campaing that you have voluteer
router.get("/campaign/volunteering/participation/history", validateToken, campaignController.volunteerParticipationHistory)
router.post("/campaign/:campaignId/update", validateToken,   upload.single("Image"), campaignController.postUpdate);

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
router.post("/issue", validateToken, validation.validateIssue, issueController.create);
router.get("/issue", issueController.index);
router.post("/issue/location", issueController.location);
router.post("/issue/generate",  issueController.generate);
router.post("/issue/:id/upvotes", validateToken, validation.validateIssueId, issueController.upvotes)
router.get("/issue/forUser", validateToken, issueController.issueForUser);
router.post("/issue/:id/join", validateToken, validation.validateIssueId, issueController.joinIssue)
router.post("/issue/:id/leave", validateToken, validation.validateIssueId, issueController.leaveIssue)
router.get("/issue/:id", validation.validateIssueId, issueController.issueDetails)
router.patch("/issue/:id", validateToken, validation.validateUpdateIssue, issueController.update)
router.delete("/issue/:id", validateToken,  validation.validateIssueId, issueController.deleteIssue)
router.post("/issue/message",validateToken, validation.validateIssueId, issueController.messages)
router.post("/issue/report", validateToken, validation.validateReport, issueController.report)
router.post("/issue/:id/share", validateToken, validation.validateIssueId, issueController.share)
router.post("/issue/:id/views",validateToken, validation.validateIssueId, issueController.views)
router.post("/issue/deleteOld", issueController.deleteOldIssues)

//search
router.get("/search", searchController.search)
router.get("/searchkeywords/trending", searchController.searchKeyword)


//hashtags
router.post("/hashtags", hashtagsController.add)
router.get("/content/hashtags/:tag", hashtagsController.getContent)

//advocate Routes
router.post("/advocate", validateToken, upload.single("video"),validation.validateAdvocate,adVocateController.add)
router.delete("/advocate/:id", validateToken, validation.validateAdvocateId, adVocateController.delete)
router.get("/advocate", validateToken, adVocateController.get)


//bookmarks 
router.post("/bookmarks", validateToken, validation.validateBookMarks,bookMarkController.add)
router.delete("/bookmarks/:id",validateToken, bookMarkController.delete);
router.get("/bookmarks",validateToken, bookMarkController.get);

module.exports = router;
