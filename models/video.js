const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const campaignSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true,
            required: false,
        },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        title: {
            type: String,
            required: false,
        },
        likes: {
            type: [String],
            default: [],
            required: true,
        },
        video_url: {
            type: String,
            required: true,
        },
        video_id: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        encoding_id: {
            type: String,
            required: false,
        },
        encoding_status: {
            type: String,
            required: false,
        },
        thumbnail_url: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

campaignSchema.plugin(mongoosePaginate);
campaignSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Video", campaignSchema);
