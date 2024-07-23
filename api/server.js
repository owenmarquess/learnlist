const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const learnlistRoutes = require('./routes/learnlistRoutes');

const app = express();
const PORT = 4000;

mongoose.connect('mongodb://localhost:27017/learnlist_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.json());

app.use('/api/learnlists', learnlistRoutes);

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
