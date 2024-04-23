module.exports = {
    Comment:require("./comment"),
    RepliesComment:require("./comment/reply"),
    CommentsLikes:require("./comment/likes"),
    Notification:require("./notification"),
    Replies:require("./comment/reply"),
    Message:require("./message"),
    Report:require("./report"),
    User: require("./user"),
    Issue:require("./issue/issue"),
    Impact:require("./impact/impact"),
    Campaign: require("./campaign/campaign"),
    Video: require("./video"),
    CampaignParticipant: require("./campaign/campaignParticipant"),
    campaignPhases:require("./campaign/campaignPhase"),
    donation:require("./campaign/campaigndonation"),
    petitions:require("./campaign/campaignPetition")
}
