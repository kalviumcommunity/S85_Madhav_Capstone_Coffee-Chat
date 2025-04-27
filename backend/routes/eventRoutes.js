const express = require('express');
const router = express.Router();
const { getAllEvents,createEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);
router.post('/createevent', createEvent);
module.exports = router;
