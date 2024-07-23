const mongoose = require('mongoose');

const learnlistSchema = new mongoose.Schema({
    name: String,
    resources: [{
        name: String,
        url: String,
        details: String,
        res_type: String
    }],
    categories: [String],
    img_path: String
});

module.exports = mongoose.model('Learnlist', learnlistSchema);
