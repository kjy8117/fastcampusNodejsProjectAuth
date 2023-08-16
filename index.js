const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const port = 4000;
//미들웨어 추가 - req의 body안 프로퍼티를 받아오는 미들웨어 
app.use(express.json());
//쿠키 파서 미들웨어 추가(클라이언트 쪽 쿠키에 저장된 리플레시 토큰을 파싱하기 위한 미들웨어)
app.use(cookieParser());
//login api 추가
//유저가 로그인 하면 서버에서 유저정보를 포함한 토큰을 생성해서 유저에게 돌려준다.
//login 경로에 username 등의 정보를 토큰에 담는다.
//jwt.sign을 통해 token 생성
//token을 생성할 때, 비밀키 정보를 담는 인자가 있다. 임시발급

const secretInfo = "secretInfo";
const refreshInfo = "refreshInfo";
let refreshTokens = [];
app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = {name: username};

    //토큰 생성
    const accessToken = jwt.sign(user, secretInfo,{
        expiresIn: '30s'
    });
    const refreshToken = jwt.sign(user, refreshInfo,{
        expiresIn: '30m'
    });

    //리토를 리토 배열에 담아주고
    refreshTokens.push(refreshToken);

    //리토를 담은 리토 배열 객체는 클라이언트의 쿠키에 담아준다.
    res.cookie('jwt', refreshTokens, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    });

    //보내줄 때 res.json!
    res.json({accessToken});
});

//리플레시 토큰으로 액세스 토큰 새로 생성하기
//'/refresh' 경로로 액토 생성
app.get('/refresh', (req, res) => {
    //요청의 body를 받아오려면, req.body인 파싱한 것처럼,
    //쿠키를 받으려면, req.cookies로 파싱. 이 파싱하는 단계에서 필요한 미들웨어 -> cookieParser
    const cookies = req.cookies;
    //쿠키 없을 경우 401 에러처리
    if(!cookies?.jwt) return res.sendStatus(403);
    //jwt 쿠키가 있다면 토큰을 받아오기 
    const refreshToken = cookies.jwt;
        //리토카 db에 있는 토큰인지 확인 \
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    
    jwt.verify(refreshToken, secretInfo, (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = jwt.sign(
            {name: username}, 
            secretInfo,
            {expiresIn: '30s'});
        res.json({accessToken});    
    });
});

const post = [
    {title: "title1", username: "username1"},
    {title: "title2", username: "username2"}
]

//post api 추가 for public access
app.get('/post', (req, res) => {
    res.json(post);});

//인증이 완료된 유저에게 즉 유효한 토큰을 가지고 있는 유저에게 post 정보를 돌려주는 미들웨어 함수 만들기
//토큰을 받은 클라이언트는 요청메시지의 헤더에 토큰을 실어 요청을 서버에게 보낸다.
//['authorization'] 이 곳에 토큰이 들어있는데
//요청 메시지 헤더에 토큰은 bearer HEADER.PAYLOAD.SECRET 형태로 되어있다. 그래서 읽어올 부분은 HEADER.PAYLOAD.SECRET이다. 그리고 이 부분은 인덱스 1번이다. (인덱스 0은 bearer)
function authMiddleware(req, res, next) {
    //토큰을 req header에서 가져오기
    const authHeader = req.headers['authorization'];
    //위 authHeader는 bearer alsdjflasjdflaskjdflk인 형태의 값
    //토큰을 받아오기
    const token = authHeader && authHeader.split(' ')[1];
    //토큰이 없으면 res.sendStatus로 401 에러 처리
    if(token == null) return res.sendStatus(401);
    //토큰이 있으니 토큰이 유효한지 확인
    jwt.verify(token, secretInfo, (err, user) => {
        if(err) return res.sendStatus(403);
        //이 인증 미들웨어를 통과한 유저의 정보는 다음 미들웨어로 전달되기 위해 
        //이렇게 선언해준다. 
        req.user= user;
        next();
    });
};

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);});

