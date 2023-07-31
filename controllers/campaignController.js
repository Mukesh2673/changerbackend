const { Campaign } = require('../models');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

exports.donate = async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);
    var stripeToken = req.body.token;
    var charge = stripe.charges.create({
        amount: req.body.amount*100, // amount in cents, again
        currency: "usd",
        card: stripeToken,
        description: req.body.description
    }, function(err, charge) {
        if (err && err.type === 'StripeCardError') {
            return res.status(401).json({message: "Card error"});
        }
        //TODO : Store purchase in DB for future reference
        return res.status(200).json({message: "Success"});
    });
}
