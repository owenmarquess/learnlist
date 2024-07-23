const Learnlist = require('../models/learnlistModel');

exports.getAllLearnlists = async (req, res) => {
    try {
        const learnlists = await Learnlist.find();
        res.status(200).json(learnlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createLearnlist = async (req, res) => {
    const { name, resources, categories, img_path } = req.body;

    try {
        const newLearnlist = new Learnlist({ name, resources, categories, img_path });
        await newLearnlist.save();
        res.status(201).json(newLearnlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Other CRUD operations (update, delete, get by ID) can be added similarly
