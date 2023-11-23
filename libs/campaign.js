const {User} = require("../models");

exports.endorseCampaign = async (user, campaignId) => {
    try {
        if (campaignId && user.endorsed_campaigns.filter(c => c === campaignId).length === 0) {
            await User.updateOne({_id: user._id}, {$push: {endorsed_campaigns: campaignId}});
        }
    } catch (e) {
        //
    }
};
