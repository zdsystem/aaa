module.exports = function(req, res, next) {
  if (!req.session.uid) {
    res.redirect('/login')
  } else {
    next();
  }
}