const express = require('express');
const router = express.Router();
const { getAllGroups } = require('../controllers/groupController');

router.get('/', getAllGroups);

module.exports = router;
