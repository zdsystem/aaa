var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var model = require('../model/model');
var md5 = require('md5');
var moment = require('moment');
var markdown = require('markdown').markdown;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index')
});
/* 登录 start */
router.get('/login', function(req, res) {
    res.render('admin/login');
});
router.post('/login', function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        model.user.find({ email: fields.email }, function(err, data) {
            if (data.length > 0) {
                var user = data[0];
                if (user.password == md5(fields.password)) {
                    req.session.uid = user._id;
                    res.render('common/success', { msg: '登录成功', time: 30000, url: '/admin' });
                } else {
                    res.render('common/error', { msg: '密码错误', time: 3000, url: '/login' })
                }
            } else {
                res.render('common/error', { msg: '用户信息不存在', time: 3000, url: '/login' });
            }
        });
    });
});
/* 登录 end */
/* 退出登录 start */
router.get('/logout', function(req, res) {
    req.session.destroy();
    res.render('common/success', { msg: '退出成功', time: 3000, url: '/login' })
})
/* 退出登录 end */

/* 列表页 start */
router.get('/articles', function(req, res) {
    var where = {};
    if (req.query.classify) {
        where['classify'] = req.query.classify;
    }
    if (req.query.keywords) {
        where['title'] = { $regex: new RegExp(req.query.keywords) }
    }
    model.category.find(function(err, categories) {
        var page = req.query.page >= 1 ? parseInt(req.query.page) : 1;
        var skip = (page - 1) * 10;
        var limit = 10;
        model.article.count(where, function(err, total) {
            var totalPage = Math.ceil(total / 10);
            var html = '<a href="/articles?page=' + (page <= 1 ? 1 : (page - 1)) + '" class="prev">上一页</a>'
            for (var i = 1; i < totalPage; i++) {
                if (i == page) {
                    html += '<a class="active" href="/articles?page=' + i + '">' + i + '</a>'
                } else {
                    html += '<a class="next" href="/articles?page=' + i + '">' + i + '</a>'
                }
            }
            html += '<a  class="next" href="/articles?page=' + (page >= totalPage ? totalPage : page + 1) + '">下一页</a>'
            model.article.find().sort({ addtime: -1 }).select({ title: 1 }).limit(5).exec(function(err, lastest) {
                model.article.find(where).skip(skip).limit(limit).exec(function(err, articles) {
                    res.render('home/article/list', { keywords: req.query.keywords, categories: categories, articles: articles, pages: html, req: req, lastest: lastest, totalPage: totalPage })
                })
            })
        });
    });
});
/* 列表页 end */
/* 详情页 start */
router.get('/:id.html', function(req, res) {
    model.category.find(function(err, categories) {
        model.article.find().sort({ addtime: -1 }).select({ title: 1 }).limit(5).exec(function(err, lastest) {
            model.article.findById(req.params.id, function(err, article) {
                var reg = /<p>/;
                if (!reg.test(article.content)) {
                    article.content = markdown.toHTML(article.content);
                }
                model.category.findById(article.classify, function(err, cate) {
                    res.render('home/article/detail', { article: article, categories: categories, lastest: lastest, req: req, cate: cate, addtime: moment(article.addtime).format('YYYYMMDD') });
                });
            })
        });
    });
});
/* 详情页 end */
/* 星文列表页 start */
router.get('/xzs', function(req, res) {
    var where = {};
    if (req.query.keywords) {
        where['title'] = { $regex: new RegExp(req.query.keywords) }
    }
    model.xz.count(where, function(err, total) {
        var totalPage = Math.ceil(total / 5);
        var page = req.query.page >= 1 ? parseInt(req.query.page) : 1;
        var skip = (page - 1) * 5;
        var limit = 5;
        var html = '<a href="/xzs?page=' + (page <= 1 ? 1 : (page - 1)) + '" class="prev">上一页</a>'
        for (var i = 1; i <= totalPage; i++) {
            console.log(totalPage)
            if (i == page) {
                html += '<a class="active" href="/xzs?page=' + i + '">' + i + '</a>'
            } else {
                html += '<a href="/xzs?page=' + i + '">' + i + '</a>'
            }
        }
        html += '<a  class="next" href="/xzs?page=' + (page >= totalPage ? totalPage : page + 1) + '">下一页</a>'
        model.xz.find().sort({ time: -1 }).select({ title: 1 }).limit(5).exec(function(err, lastest) {
            model.xz.find(where).skip(skip).limit(limit).exec(function(err, data) {
                res.render('home/xz/list', { req: req, xz: data, pages: html, lastest: lastest, totalPage: totalPage, keywords: req.query.keywords, })
            });
        });
    });
});
/* 星文列表页 end */
/* 星文详情页 start */
router.get('/:id.php', function(req, res) {
    model.article.find().sort({ time: -1 }).select({ title: 1 }).limit(5).exec(function(err, lastest) {
        model.xz.findById(req.params.id, function(err, data) {
            var reg = /<\/p>/;
            if (!reg.test(data.content)) {
                data.content = markdown.toHTML(data.content);
            }
            res.render('home/xz/detail', { xz: data, lastest: lastest, req: req })
        })
    })
})
/* 星文详情页 end */
module.exports = router;