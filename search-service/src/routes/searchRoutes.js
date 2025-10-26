const express = require('express');
const { searchPost } = require('../controllers/searchController');
const authenticateReq = require('../middlewares/authMiddleware');

const router = express.Router()


router.use(authenticateReq)

router.get('/searchpost', searchPost)

module.exports = router;
