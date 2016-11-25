/**
 * Created by lim on 2016-11-24.
 */

var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

var router = express.Router();


var User = require('../Model/User');

router.post('/', function (req, res, next) {
    var userKey = req.body.user_key;
    var content = req.body.content;

    findUserPromise(userKey)
        .then(function (user) {
            if (content.charAt(0) == '/') {
                if (content == '/설정') {
                    res.set('Content-Type', 'application/json');
                    res.json({
                        "message": {
                            "text": "언어를 선택하세요"
                        },
                        "keyboard": {
                            "type": "buttons",
                            "buttons": [
                                "/한국어->영어",
                                "/한국어->일본어",
                                "/한국어->중국어(간체)",
                                "/영어->한국어",
                                "/일본어->한국어",
                                "/중국어(간체)->한국어"
                            ]
                        }
                    });
                } else if (content == '/번역하기') {
                    res.set('Content-Type', 'application/json');
                    res.json({
                        "message": {
                            "text": "언어설정 메뉴는 /설정 이라고 타이핑 하세요"
                        },
                        "keyboard": {
                            "type": "text"
                        }
                    });
                } else if((content == '/한국어->영어') ||
                    (content == '/한국어->일본어') ||
                    (content == '/한국어->중국어(간체)') ||
                    (content == '/영어->한국어') ||
                    (content == '/일본어->한국어') ||
                    (content == '/중국어(간체)->한국어')){
                    //console.log(content.toString().search("/한") || content.toString().search("/영") || content.toString().search("/일") || content.toString().search("/중"))
                    var sl = choiceLanguage(content.split("/")[1].split("->")[0]);
                    var tl = choiceLanguage(content.split("/")[1].split("->")[1]);
                    User.findOneAndUpdate(
                        {'user_key': userKey},
                        {'sourceLanguage': sl, 'targetLanguage': tl},
                        function (err, user) {
                            if (err) {
                                res.end();
                            } else {
                                res.set('Content-Type', 'application/json');
                                res.json({
                                    "message": {
                                        "text": "메뉴를 선택하세요"
                                    },
                                    "keyboard": {
                                        "type": "buttons",
                                        "buttons": ["/설정", "/번역하기"]
                                    }
                                });
                            }
                        });
                }else{
                    res.set('Content-Type', 'application/json');
                    res.json({
                        "message": {
                            "text": "/ 기호가 들어간 명령어는 사용할 수 없습니다."
                        }
                    });
                }
            } else {
                User.find({'user_key': userKey}, function (err, data) {
                    var client_id = '네이버 client key';
                    var client_secret = '네이버 시크릿 키';
                    var api_url = 'https://openapi.naver.com/v1/language/translate';

                    var text = content;
                    var target = data[0].targetLanguage;
                    var source = data[0].sourceLanguage;
                    var options = {
                        url: api_url,
                        form: {'source': source, 'target': target, 'text': text},
                        headers: {'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret}
                    };
                    request.post(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var bodyJson = JSON.parse(body);
                            res.set('Content-Type', 'application/json');
                            res.json({
                                "message": {
                                    "text": bodyJson.message.result.translatedText
                                }
                            });
                        } else {
                            console.log(error)
                            res.json({
                                "message": {
                                    "text": "번역 실패"
                                }
                            });
                        }
                    });
                })
            }
        }, function (error) {

        })
});

var findUserPromise = function (userKey) {
    return new Promise(function (resolve, reject) {
        User.find({'user_key': userKey}, function (err, data) {
            if (err) {
                reject('실패');
            } else {
                if (data.length == 0) {
                    var newUser = User({
                        user_key: userKey,
                        sourceLanguage: "ko",
                        targetLanguage: "en"
                    })
                    newUser.save(function (err) {
                        if (err) {
                            reject('실패');
                        } else {
                            resolve({
                                user_key: userKey,
                                sourceLanguage: "ko",
                                targetLanguage: "en"
                            });
                        }
                    })
                } else {
                    resolve({
                        user_key: userKey,
                        sourceLanguage: data.sourceLanguage,
                        targetLanguage: data.targetLanguage
                    });
                }
            }
        });
    });
}

function findUserPromise(name) {
    var promise = User.find({userKey: userKey}).exec();
    return promise;
}

function choiceLanguage(str) {

    if (str == "영어")
        return "en";
    else if (str == "한국어") {
        console.log(str);
        return "ko";
    }
    else if (str == "일본어")
        return "ja";
    else if (str == "중국어(간체)")
        return "zh-CN";
    else
        return "ko";
}
module.exports = router;
