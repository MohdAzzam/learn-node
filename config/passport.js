const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../model/User');
const Cart = require('../model/Cart');


passport.serializeUser((user,done)=>{
    return done(null,user.id);
})
passport.deserializeUser((id,done)=>{
    User.findById(id,('email userName contact address image '),(error,user)=>{
        Cart.findById(id,(error,cart)=>{
            if (!cart){
                return done(error,user)
            }
            user.cart=cart;
            return done(error,user);
        })
    });
});
passport.use('local-signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, (req, email, password, done) => {
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, req.flash('signinError', 'User not found'));
        }
        if (!user.comparePassword(password)) {
            return done(null, false, req.flash('signinError', 'Wrong Password'))
        }
        return done(null, user);
    });
}));

passport.use('local-signup',new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
},(req,email,password,done)=>{
    User.findOne({email:email},(err,user)=>{
        if(err){
            return done(err)
        }
        if(user){
            return done(null,false,req.flash('signupError','email alredy token'));                 
        }
        const newUser=new User({
            email:email,
            password:new User().hashPassword(password),
        });
        newUser.save((error,user)=>{
            if(error){
                return done(error)
            }
            return done(null,user);
        });
    });
}));