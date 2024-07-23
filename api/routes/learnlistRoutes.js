const express = require('express');
const { getAllLearnlists, createLearnlist } = require('../controllers/learnlistController');

const router = express.Router();

router.get('/', getAllLearnlists);
router.post('/', createLearnlist);

// Other CRUD routes can be added similarly

module.exports = router;
