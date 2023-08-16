const passport = require('passport');
const User = require('../model/users.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').Strategy;


//환경변수
require('dotenv').config();


//서버에서 세션를 생성하기 위해 serialize을 사용한다.
//server.js의 app.post('/login')에서 req.logIn(user)를 가지고 유저정보가 담긴 세션을 서버측에서 만든다. 
passport.serializeUser((user, done)=>{
    done(null, user.id); //(에러 부분은 없고, userinfo 부분)
});
//서버로부터 세션을 받은 클라이언트가 다시 세션을 담아 요청을 서버에게 보낸다.
passport.deserializeUser((id, done)=>{
    //위 id 인자값을 가지고 db에서 해당 id에 맞는 유저 정보를 가지고 온다.
    User.findById(id)
        .then(user => {done(null, user)
        })
    //해당 유저 정보를 찾았으면 req.user에 유저정보를 할당해준다. 
    //req.user = user; 
});

const LocalStrategyConfig = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    (email, password, done) => {
        //유저가 있는지 확인한다. 
        User.findOne({ email: email.toLocaleLowerCase() 
        }, (err, user) => {
            if(err) return done(err);
            if(!user) {
                // error, userinfo, info 
                return done(null, false, { message: 'Incorrect email.' });
            }
            //comparePassword는 모델의 스키마에서 생성해주었고
            // 비밀번호를 입력받아 비밀번호가 일치하는지 확인한다.
            user.comparePassword(password, (err, isMatch) => {
                if(err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password.' });
                }
            });
        })
    }
);
passport.use('local', LocalStrategyConfig);


const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleStrategyConfig = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile']
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id }, (err, existingUser) => {
        if (err) return done(err);
        if (existingUser) {
            return done(null, existingUser);
        } else{
            const newUser = new User();
            newUser.googleId = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value;
            newUser.save((err) => {
                if (err) return done(err);
                return done(null, newUser);});
        }
    });
});
passport.use('google', googleStrategyConfig);
