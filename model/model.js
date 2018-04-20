var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/project');
var userSchema = new mongoose.Schema({
    profile: String,
    password: String,
    email: String,
    nickname: String,
    addtime: Date
});
var userModel = mongoose.model('user', userSchema);
var categorySchema = new mongoose.Schema({
    name: String
});
var categoryModel = mongoose.model('category', categorySchema);
var articleSchema = new mongoose.Schema({
    title: String,
    addtime: Date,
    content: String,
    cishu: Number,
    intro: String,
    pic: String,
    classify: String
});
var articleModel = mongoose.model('article', articleSchema);
var xzSchema = new mongoose.Schema({
    title: String,
    time: String,
    from: String,
    content: String,
    img: String,
    author:String
});
var xzModel = mongoose.model('xz',xzSchema);
module.exports = {
    user: userModel,
    category: categoryModel,
    article: articleModel,
    xz:xzModel
}
