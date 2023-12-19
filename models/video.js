const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongoolia = require('mongoolia').default;

const Schema = mongoose.Schema;

const videoSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true,
            required: false,
            algoliaIndex: true
        },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: false,
            algoliaIndex: true
        },
        issue:{
            type: Schema.Types.ObjectId,
            ref: "issue",
            required: false,
            algoliaIndex: true
        },
        description: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        title: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        likes: {
            type: [String],
            default: [],
            required: true,
            algoliaIndex: true

        },
        video_url: {
            type: String,
            required: true,
            algoliaIndex: true
        },
        video_id: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        type: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        encoding_id: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        encoding_status: {
            type: String,
            required: false,
            algoliaIndex: true
        },
        thumbnail_url: {
            type: String,
            required: false,
            algoliaIndex: true
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongoosePaginate);
videoSchema.plugin(mongoolia,{
    appId:process.env.ALGOLIA_APP_ID,
    apiKey:process.env.ALGOLIA_API_KEY,
    indexName:'Videos'

});
videoSchema.plugin(require("mongoose-autopopulate"));
module.exports = mongoose.model("Video", videoSchema);
