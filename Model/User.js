/**
 * Created by lim on 2016-11-24.
 */
var mongoose = require('mongoose');
mongoose.connect('디비주소');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    user_key: String,
    sourceLanguage:String,
    targetLanguage:String
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
