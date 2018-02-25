const express = require('express');
const router = express.Router();

const counter = require('./counter.js');
const kitchen = require('./kitchen.js');
const admin = require('./admin.js');
const menu = require('./menu.js');

router.use('/counter', counter);
router.use('/kitchen', kitchen);
router.use('/admin', admin);
router.use('/menu', menu);

module.exports = router;