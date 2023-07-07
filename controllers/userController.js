const { User } = require('../models');

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        return res.json(user);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

exports.getUserByUID = async (req, res, next) => {
    try {
        const user = await User.findOne({uid: req.params.uid});
        return res.json(user);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({username: req.body.username});
        if (existingUser) {
            return res.status(403).json({message: "username-exists"})
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }

    const user = new User({
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        uid: req.body.uid,
        email: req.body.email,
    })

    try {
        const savedUser = await user.save();
        return res.status(200).json(savedUser);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }

}
