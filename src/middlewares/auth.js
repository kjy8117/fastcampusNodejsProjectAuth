//로그인하여 인증 성공한 경우
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

//인증이 안 되었을 경우
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }    
    next();
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}