const { Video } = require('../models');

exports.index = async (req, res, next) => {
    try {
        const { page = 1, campaign, user } = req.query;

        const query = {};

        if (!!campaign) {
            query['campaign'] = campaign
        }

        if (!!user) {
            query['user'] = user
        }

        const result = await Video.paginate(query, {
            page,
            sort: { createdAt: 'desc' },
        });

        return res.json(result);
    } catch (error) {
        return res.json([]);
    }
}

exports.show = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!!video) {
            return res.json(video);
        }

        return res.status(404).json({message: "Video not found."});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

exports.store = async (req, res, next) => {
    const user = req.user;

    const video = new Video({
        user: user._id,
        campaign: req.body.campaign,
        description: req.body.description,
        likes: 0,
        video_url: req.body.video_url,
        video_id: req.body.video_id,
    });

    try {
        const savedVideo = await video.save();
        return res.status(200).json(savedVideo);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }

}

exports.update = async (req, res, next) => {

}

exports.delete = async (req, res, next) => {

}

exports.encodingFinishedHook = (req, res, next) => {
    const encodingId = req.body?.encoding?.id;

    if (encodingId) {
        try {
            const query = {
                encoding_id: encodingId,
                encoding_status: 'CREATED'
            };

            Video.updateMany(query, {encoding_status: 'FINISHED'}).exec();

        } catch (error) {
            return res.json([]);
        }
    }

    return res.json([]);
}
