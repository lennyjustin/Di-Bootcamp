const express = require('express');
const controller = require('../controllers/usersController');

const router = express.Router();
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);

module.exports = router;
