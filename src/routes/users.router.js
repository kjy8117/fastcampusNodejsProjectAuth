const express = require('express');
const usersRouter = express.Router();
const passport = require('passport');
const sendEmail = require('../mail/mail');
const User = require('../model/users.model');
const {checkAuthenticated, checkNotAuthenticated} = require('../middlewares/auth');

//로그인 기능 구현
usersRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) return next(err);
        if(!user) return res.join({msg: info});
        //실제 유저도 있고 비밀번호도 맞았다면
        //passport에 있는 passport.use(new LocalStrategy)로직에서 정보가 다 맞다면 
        //아래와 같은 세션을 생성한다. 
        //세션을 거치면 user 정보가 req.user로 할당된다.  
        req.logIn(user, (err) => {
            if(err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next); 
    //위와 같은 미들웨어 안에 미들웨어 구조에서 외부 미들웨어 인자 req, res, next들을
    //내부 미들웨어로 끌어 올려면 (req, res, next)를 마지막에 덧붙이면 된다. 
});

//로그아웃 기능 구현
usersRouter.post('/logout', (req, res,next) => {
    req.logOut(function(err){ 
        if(err) return next(err);
        res.redirect('/login')
    });     
});

//회원가입 기능 구현
usersRouter.post('/signup', async (req, res) => {
    //유저 객체 생성
    //유저 모델 필요
    const user = new User(req.body);

    try{
        await user.save();
        //이메일 보내기
        sendEmail('max123@example.com', 'max Han', 'welcome');
        //return res.status(200).json({
        //    success: true,
        //    message: '회원가입이 완료되었습니다.'});
        res.redirect('/login');
    } catch (err) {
        console.log(err); }
    }
);

usersRouter.get('/google', passport.authenticate('google'));
//이제 google에 맞는 소스코드를 passport 파일에 작성한다.
usersRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = usersRouter;