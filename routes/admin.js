var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var md5 = require('md5');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/project');
var model = require('../model/model');
var articleModel = model.article;
var categoryModel = model.category;
var userModel = model.user;
var xzModel = model.xz;


/* GET home page. */
router.get('/admin', function(req, res, next) {
    res.render('admin/index');
});
/* 用户注册 start */
router.get('/user/create', function(req, res) {
    var error = req.flash('err');
    if (error.length > 0) {
        var message = error[0];
    } else {
        message = '';
    }
    res.render('admin/user/create', { message: message });
});
router.post('/user', function(req, res) {
    var form = new formidable.IncomingForm();
    //修改文件上传的目录
    form.uploadDir = "./public/uploads";
    //保留后缀名
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {;
        var path = files.profile.path.replace(/\\/g, '/')
        var index = path.indexOf('/')
        var p = path.substr(index);
        fields.profile = p;
        fields.password = md5(fields.password);
        fields.repassword = md5(fields.repassword);
        var userEntity = new userModel(fields);
        userEntity.save(function(err, data) {
            if (!fields.email) {
                req.flash('err', '用户名不能为空');
                res.redirect('back');
                return;
            }
            console.log(fields);
            if (fields.password != fields.repassword) {
                req.flash('err', '两次密码不一致');
                res.redirect('back');
                return;
            }
            res.render('common/success', { msg: '添加成功', time: 3000, url: '/user' })
        });
    });
});
/* 用户注册 end */
/* 用户列表 start */
router.get('/user', function(req, res) {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = 10;
    var skip = (page - 1) * limit;
    userModel.count(function(err, total) {
        var totalPage = Math.ceil(total / limit);
        var html = '<a href="/user?page=' + (page <= 1 ? 1 : (page - 1)) + '" class="prev">上一页</a>'
        for (var i = 1; i <= totalPage; i++) {
            if (i == page) {
                html += '<a class="active" href="/user?page=' + i + '">' + i + '</a>'
            } else {
                html += '<a href="/user?page=' + i + '">' + i + '</a>'
            }
        }
        html += '<a class="next" href="/user?page=' + (page >= totalPage ? totalPage : (page + 1)) + '">下一页</a>'
        userModel.find({}).skip(skip).limit(limit).exec(function(err, users) {
            res.render('admin/user/index', { users: users, pages: html });
        });
    });
});
/* 用户列表 end */
/* 用户修改 start */
router.get('/user/:id/edit', function(req, res) {
    userModel.findById(req.params.id, function(err, data) {
        res.render('admin/user/edit', { user: data });
    });
});
router.post('/user/:id/update', function(req, res) {
    userModel.findById(req.params.id, function(err, user) {
        var form = new formidable.IncomingForm();
        //修改文件上传的目录
        form.uploadDir = "./public/uploads";
        //保留后缀名
        form.keepExtensions = true;

        form.parse(req, function(err, fields, files) {
            user.profile = fields.profile;
            user.email = fields.email;
            user.password = md5(fields.password);
            user.nickname = fields.nickname;
            if (files.profile.size != 0) {
                var path = files.profile.path.replace(/\\/g, '/')
                var index = path.indexOf('/')
                var p = path.substr(index);
                user.profile = p;
            }
            user.save(function(err, data) {
                if (err) {
                    res.render('common/error', { msg: '添加失败', time: 3000, url: '/user' });
                } else {
                    res.render('common/success', { msg: '添加成功', time: 3000, url: '/user' });
                }
            });
        });
    });
});
router.get('admin/update', function(req, res) {
    var id = req.query.id;
    userModel.findById(id, function(err, user) {
        user.nickname = req.query.nickname;
        user.password = req.query.password;
        user.profile = req.query.profile;
        if (err) {
            res.json({ code: 1, msg: '更新失败' })
        } else {
            res.json({ code: 0, msg: '更新成功' })
        }
    })
})
router.get('/user/update', function(req, res) {
    var id = req.query.id;
    userModel.findById(id, function(err, user) {
        user.nickname = req.query.nickname;
        user.save(function(err) {
            if (!err) {
                res.json({ code: 0, msg: '更新成功' });
            } else {
                res.json({ code: 1, msg: '更新失败' });
            }
        })
    })
})
/* 用户修改 end */
/* 用户删除 start */
router.get('/user/:id/delete', function(req, res) {
    userModel.findById(req.params.id, function(err, user) {
        user.remove(function(err) {
            if (err) {
                res.render('common/error', { msg: '删除失败', time: 3000, url: '/user' });
            } else {
                res.render('common/success', { msg: '删除成功', time: 5000, url: '/user' });
            }
        });
    });
});
/* 用户删除 end */
/* 分类部分 start */
/* 分类添加 start */
router.get('/category/create', function(req, res) {
    res.render('admin/category/create');
})
router.post('/category', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        categoryModel.find({ name: fields.name }, function(err, data) {
            if (data.length > 0) {
                res.render('common/error', { msg: '该分类名称已经存在,请更换', time: 3000, url: '/category/create' })
            } else {
                var categoryEntity = new categoryModel({ name: fields.name });
                categoryEntity.save(function(err, data) {
                    if (!err) {
                        res.render('common/success', { msg: '添加成功', time: 3000, url: '/category' });
                    } else {
                        res.render('common/error', { msg: '添加失败', time: 3000, url: '/category/create' })
                    }
                });
            }
        });
    });
});
/* 分类添加 end */
/* 分类列表 start */
router.get('/category', function(req, res) {
    categoryModel.find(function(err, data) {
        if (!err) {
            res.render('admin/category/index', { cates: data });
        }
    });
});
/* 分类列表 end */
/* 分类修改 start */
router.get('/category/:id/edit', function(req, res) {
    categoryModel.findById(req.params.id, function(err, data) {
        if (!err) {
            res.render('admin/category/edit', { category: data });
        }
    });
});
router.post('/category/:id/update', function(req, res) {
    categoryModel.findById(req.params.id, function(err, data) {
        if (!err) {
            var form = new formidable.IncomingForm();
            //修改文件上传的目录
            form.uploadDir = "./public/uploads";
            //保留后缀名
            form.keepExtensions = true;

            form.parse(req, function(err, fields, files) {
                data.name = fields.name;
                data.save(function(err) {
                    if (!err) {
                        res.render('common/success', { msg: '更新成功', time: 3000, url: '/category' });
                    }
                });
            });
        }
    });
});
/* 分类修改 end */
/* 分类删除 start */
router.get('/category/:id/delete', function(req, res) {
    categoryModel.findById(req.params.id, function(err, data) {
        data.remove(function(err) {
            if (!err) {
                res.render('common/success', { msg: '删除成功', time: 3000, url: '/category' })
            }
        });
    });
});
/* 分类删除 end */
/* 分类部分 end */
/* 文章管理 start */
/* 文章添加 start */
router.get('/article/create', function(req, res) {
    categoryModel.find(function(err, categories) {
        if (!err) {
            res.render('admin/article/create', { categories: categories });
        }
    })
});
router.post('/uploads', function(req, res) {
    var form = new formidable.IncomingForm();
    //修改文件上传的目录
    form.uploadDir = "./public/uploads";
    //保留后缀名
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        var path = files['editormd-image-file'].path.replace(/\\/g, '/')
        var index = path.indexOf('/')
        var p = path.substr(index);
        res.json({
            success: 1,
            message: "添加成功",
            url: p
        });
    });
});
router.post('/article', function(req, res) {
    var form = new formidable.IncomingForm();
    //修改文件上传的目录
    form.uploadDir = "./public/uploads";
    //保留后缀名
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        var path = files.pic.path.replace(/\\/g, '/')
        var index = path.indexOf('/')
        var p = path.substr(index);
        fields.pic = p;
        fields.cishu = 0;
        fields.addtime = Date.now();
        var articleEntity = new articleModel(fields);
        articleEntity.save(function(err, data) {
            if (!err) {
                res.render('common/success', { msg: '添加成功', time: 3000, url: '/article' })
            } else {
                res.render('common/success', { msg: '添加失败', time: 3000, url: '/article' })
            }
        })
    })
})
/* 文章添加 end */
/* 文章列表 start */
router.get('/article', function(req, res) {
    articleModel.find(function(err, data) {
        if (!err) {
            res.render('admin/article/index', { articles: data });
        }
    });
});
/* 文章列表 end */
/* 文章修改 start */
router.get('/article/:id/edit', function(req, res) {
    articleModel.findById(req.params.id, function(err, data) {
        if (!err) {
            res.render('admin/article/edit', { articles: data });
        }
    });
});
router.post('/article/:id/update', function(req, res) {
    articleModel.findById(req.params.id, function(err, data) {
        if (!err) {
            var form = new formidable.IncomingForm();
            //修改文件上传的目录
            form.uploadDir = "./public/uploads";
            //保留后缀名
            form.keepExtensions = true;

            form.parse(req, function(err, fields, files) {
                data.title = fields.title;
                data.pic = fields.pic;
                data.classify = fields.classify;
                data.intro = fields.intro;
                data.content = fields.content;
                data.save(function(err) {
                    if (!err) {
                        res.render('common/success', { msg: '更新成功', time: 3000, url: '/article' });
                    }
                });
            });
        }
    });
})
/* 文章修改 end */
/* 文章删除 Start */
router.get('/article/:id/delete', function(req, res) {
    articleModel.findById(req.params.id, function(err, data) {
        data.remove(function(err) {
            if (!err) {
                res.render('common/success', { msg: '删除成功', time: 3000, url: '/article' })
            }
        });
    });
});
/* 文章删除 end */
/* 文章管理 end */
/* 星座 Start */
/* 星座添加 start */
router.get('/xingzuo/create', function(req, res) {
    res.render('admin/xingzuo/create')
});
router.post('/xingzuo', function(req, res) {
    var form = new formidable.IncomingForm();
    //修改文件上传的目录
    form.uploadDir = "./public/uploads";
    //保留后缀名
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        var path = files.img.path.replace(/\\/g, '/')
        var index = path.indexOf('/')
        var p = path.substr(index);
        fields.img = p;
        var xzEntity = new xzModel(fields);
        xzEntity.save(function(err, data) {
            console.log(data)
            if (!err) {
                res.render('common/success', { msg: '添加成功', time: 3000, url: '/xingzuo' })
            } else {
                res.render('common/error', { msg: '添加失败', time: 3000, url: '/xingzuo' })
            }
        });
    });
});
/* 星座添加 end */
/* 星座列表 start */
router.get('/xingzuo', function(req, res) {
    xzModel.find(function(err, data) {
        if (!err) {
            res.render('admin/xingzuo/index', { xz: data });
        }
    });
});
/* 星座列表 end */
/* 星文修改 start */
router.get('/xingzuo/:id/edit', function(req, res) {
    xzModel.findById(req.params.id, function(err, data) {
        if (!err) {
            res.render('admin/xingzuo/edit', { xz: data });
        }
    });
});
router.post('/xingzuo/:id/updata', function(req, res) {
    xzModel.findById(req.params.id, function(err, data) {
        if (!err) {
            var form = new formidable.IncomingForm();
            //修改文件上传的目录
            form.uploadDir = "./public/uploads";
            //保留后缀名
            form.keepExtensions = true;

            form.parse(req, function(err, fields, files) {
                data.title = fields.title;
                data.img = fields.img;
                data.author = fields.author;
                data.content = fields.content;
                data.from = fields.from;
                data.save(function(err) {
                    if (!err) {
                        res.render('common/success', { msg: '更新成功', time: 3000, url: '/xingzuo' })
                    }
                })
            })
        }
    });
});
/* 星文修改 end */
/* 星文删除 start */
router.get('/xingzuo/:id/delete', function(req, res) {
    xzModel.findById(req.params.id, function(err, data) {
        data.remove(function(err) {
            if (!err) {
                res.render('common/success', { msg: '删除成功', time: 3000, url: '/xingzuo' })
            }
        });
    });
});
/* 星文删除 end */
/* 星座 end */
module.exports = router;