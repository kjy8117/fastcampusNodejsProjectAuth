const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
    },
    password:{
        type: String,
        minLength : 8,
    },
    googleId:{
        type: String,
        unique: true, 
        sparse: true       
    },
});
//비밀번호 암호화 salt 사용
const saltRounds = 10;
userSchema.pre('save', function(next) {
    let user = this; 
    //비밀번호가 변경될 때만
    if(user.isModified('password')){
        //솔트 생성
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err);

            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

//comparePassword 메소드 생성
//비번 비교 메소드 생성
userSchema.methods.comparePassword = function(plainPassword, cb){
    //bycrypt compare 비교
    //plainPassword는 유저가 로그인할 때 입력한 것이고 this.password는 db에 있는 pw
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

//스키마 기반 모델을 생성
const User = mongoose.model('User', userSchema);

module.exports = User;