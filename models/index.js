module.exports = {
    Comment:require("./comment"),
    Notification:require("./notification"),
    Replies:require("./comment/reply"),
    Message:require("./message"),
    Report:require("./report"),
    User: require("./user"),
    Upvotes:require("./upvotes"),
    Issue:require("./issue/issue"),
    Impact:require("./impact/impact"),
    Campaign: require("./campaign/campaign"),
    Video: require("./video"),
    CampaignParticipant: require("./campaign/campaignParticipant"),
    campaignPhases:require("./campaign/campaignPhase"),
    donation:require("./campaign/campaigndonation"),
    petitions:require("./campaign/campaignPetition")
}
