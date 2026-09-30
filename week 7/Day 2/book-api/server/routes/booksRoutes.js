const express = require('express');
const controller = require('../controllers/booksController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:bookId', controller.getOne);
router.post('/', controller.create);
router.put('/:bookId', controller.update);
router.delete('/:bookId', controller.remove);

module.exports = router;
