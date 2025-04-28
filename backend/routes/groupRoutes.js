const express = require('express');
const router = express.Router();
const { getAllGroups,createGroup,updateGroup,deleteGroup } = require('../controllers/groupController');

router.get('/', getAllGroups);
router.post('/creategroup', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
module.exports = router;
