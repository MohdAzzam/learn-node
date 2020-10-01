var express = require('express');
var router = express.Router();
const User = require('../model/User');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const csrf = require('csurf');
const Order = require('../model/Order');
const multer = require('multer');
const fs = require('fs');

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(new Error('Image Should be in PNG OR JPG OR JPEG'), false)
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname)
  },

});
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,

});

router.use(upload.single('myfile'), (err, req, res, next) => {
  if (err) {
    req.flash('profileImageError', [err.message])
    res.redirect('profile')
  }
});
router.use(csrf());

/* GET users listing. */
router.get('/signup', isNotSignIn, function (req, res, next) {
  var massagesError = req.flash('signupError');

  res.render('user/signup', { massages: massagesError, checkUser: req.isAuthenticated(), csrfToken: req.csrfToken() });
});
router.post('/signup', [
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('please enter vaild email'),
  check('password').not().isEmpty().withMessage('password should not be empty'),
  check('password').isLength({ min: 5 }).withMessage('Password should be more than 5 char'),
  check('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password not match')
    }
    return true;
  }),

], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('signupError', validationMassages);
    res.redirect('signup');
    console.log(validationMassages);
    return;
  }
  next()
}, passport.authenticate('local-signup',
  {
    session: false,
    successRedirect: 'signin',
    failureRedirect: 'signup',
    failureFlash: true,
  }));

router.get('/profile', isSignIn, (req, res, next) => {

  if (req.user.cart) {
    totalProduct = req.user.cart.totalQuantity;
  }
  else {
    totalProduct = 0;
  }
  Order.find({ user: req.user.id }, (error, doc) => {
    if (error) {
      console.log(error)
    }
    // console.log(doc);

    var massagesError = req.flash('profileError');
    var messageImageError = req.flash('profileImageError');
    var hasError = false;
    if (massagesError.length > 0) {
      hasError = true;
    }
    console.log(req.user);
    res.render('user/profile', {
      checkUser: true,
      checkProfile: true,
      totalProduct: totalProduct,
      userOrder: doc,
      csrfToken: req.csrfToken(),
      massagesError: massagesError,
      hasError: hasError,
      user: req.user,
      messageImageError: messageImageError,

    });
  })

});
router.post('/updateuser', [
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('please enter vaild email'),
  check('password').not().isEmpty().withMessage('password should not be empty'),
  check('password').isLength({ min: 5 }).withMessage('Password should be more than 5 char'),
  check('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password not match')
    }
    return true;
  }),
  check('username').not().isEmpty().withMessage('User name can\'t be Empty'),
  check('address').not().isEmpty().withMessage('Address can\'t be Empty'),
  check('contact').not().isEmpty().withMessage('Contact can\'t be Empty'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('profileError', validationMassages);
    res.redirect('profile');
    console.log(validationMassages);
    return;
  } else {
    console.log('user done')
    const updatedUser = {
      userName: req.body.username,
      email: req.body.email,
      contact: req.body.contact,
      address: req.body.address,
      password: new User().hashPassword(req.body.password),
    }
    User.updateOne({ _id: req.user._id }, { $set: updatedUser }, (error, doc) => {
      if (error) {
        console.log(error)
      }
      console.log(doc);
      res.redirect('profile')
    })
  }
})

router.get('/signin', isNotSignIn, (req, res, next) => {
  var massagesError = req.flash('signinError');
  res.render('user/signin', { massages: massagesError, csrfToken: req.csrfToken() });
});

router.post('/signin', [
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('please enter vaild email'),
  check('password').not().isEmpty().withMessage('password should not be empty'),

], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg);
    }
    req.flash('signinError', validationMassages);
    res.redirect('signin');
    console.log(validationMassages);
    return;

  }
  next();
},
  passport.authenticate('local-signin', {
    successRedirect: 'profile',
    failureRedirect: 'signin',
    failureFlash: true,

  }));
router.get('/logout', isSignIn, (req, res, next) => {
  req.logOut();
  res.redirect('/');
});

function isSignIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('signin');
    return;
  }

};
function isNotSignIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
    return;
  }
  next()
}

router.post('/uploadfile', upload.single('myfile'), (req, res, next) => {
  const path = "./public" + req.user.image;
  fs.unlink(path, (error) => {
    if (error) {
      console.log("what the fuck ");
      req.flash('profileImageError', [error.message])
      res.redirect('profile')
      return;
    } else {
      console.log(req.file)
      //remove the first 6 letter from the path 
      const newUser = {
        image: (req.file.path).slice(6),
      };
      //update user image
      User.updateOne({ _id: req.user._id }, { $set: newUser }, (error, doc) => {
        if (error) {
          console.log(error)
        } else {
          console.log(doc)
          res.redirect('profile')
        }
      })
    }
  })

})
module.exports = router;
