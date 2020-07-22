const router = require('express').Router();
const { get } = require('./mappings.controller');

router.get('/get', get);

module.exports = router;