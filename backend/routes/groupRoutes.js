const express = require('express');
const router = express.Router();
const { getAllGroups,createGroup,updateGroup } = require('../controllers/groupController');

router.get('/', getAllGroups);
router.post('/creategroup', createGroup);
router.put('/:id', updateGroup);
module.exports = router;
