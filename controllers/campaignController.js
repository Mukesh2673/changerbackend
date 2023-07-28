const { Campaign } = require('../models');

exports.index = async (req, res, next) => {
    try {
        const { page = 1, user, cause } = req.query;

        const query = {};

        if (!!user) {
            query['user'] = user
        }

        if (!!cause) {
            query['cause'] = cause
        }

        const result = await Campaign.paginate(query, {
            page,
            sort: { createdAt: 'desc' }
        });

        return res.json(result);
    } catch (error) {
        return res.json([]);
    }
}

exports.show = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!!campaign) {
            return res.json(campaign);
        }

        return res.status(404).json({message: "Campaign not found."});
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
