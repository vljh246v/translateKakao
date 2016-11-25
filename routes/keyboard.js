/**
 * Created by lim on 2016-11-24.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.set('Content-Type', 'application/json');
    res.json({"type":"buttons","buttons":["/설정", "/번역하기"]});
});

module.exports = router;
