const express = require('express');
const router = express.Router();
const { getAllUsers,createUser } = require('../controllers/userController');


router.get('/signup', getAllUsers);
router.post('/createuser', createUser);
module.exports = router;
