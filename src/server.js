const express = require('express');
const app = express();
const {default: mongoose} = require('mongoose');
const passport = require('passport');
const path = require('path');
//ejs view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//const User = require('./model/users.model');
//const cookieSession = require('cookie-session');
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');

app.use('/', mainRouter);
app.use('/auth', usersRouter);

const config = require('config');
const serverConfig = config.get('server');
const port = serverConfig.port;

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//form 안에 있는 요소를 파싱해서 가져오기 위해

mongoose.set('strictQuery', false);
mongoose.connect("mongourl")
    .then(() => {
        console.log("mongodb is connected")
    })
    .catch((err) => {
        console.log(err);
    });
//정적 파일 제공하는 express.static 미들웨어 등록
app.use('/static', express.static(path.join(__dirname,'public')));


//쿠키세션 생성
const cookieSession = require('cookie-session');
//const { checkAuthenticated } = require('./middlewares/auth');
app.use(cookieSession(
    {   
        name: 'cookieName',
        keys: ['cookieSecretKey']
    }
));
//register regenerate & save after the cookieSession middleware initialization
app.use(function(req, res, next) {ㅇㅣㄼ
    if(req.session && req.session.regenerate) {
        req.session.regerate = (cb) => {
            cb();
        }
    }
    if(req.session && !req.session.save){
        req.session.save = (cb) => {
            cb();
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);});