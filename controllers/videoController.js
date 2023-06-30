const { Video } = require('../models');

exports.index = async (req, res, next) => {
    try {
        const { page = 1 } = req.query;

        const result = await Video.paginate({ }, {
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

exports.create = async (req, res, next) => {

}

exports.update = async (req, res, next) => {

}

exports.delete = async (req, res, next) => {

}
