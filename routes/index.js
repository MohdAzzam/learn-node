var express = require('express');
var router = express.Router();
const Product = require('../model/Product');
const Cart = require('../model/Cart');
const stripe = require('stripe')('sk_test_51HWer9HlyknK7kz5TsS5zyEk48AapYmFjlugT0YGX7OdBuLFipOgQVSYbzBVpFZqkRyghwJF3wR1JJg1bV9XZuqF004vGsZ5zW');
const Order = require('../model/Order');
/* GET home page. */
router.get('/', function (req, res, next) {
  const successMassage = req.flash('success')[0];
  var totalProduct = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProduct = req.user.cart.totalQuantity;
    }
    else {
      totalProduct = 0;
    }
  }

  Product.find({}, (error, doc) => {
    if (error) {
      console.log(error);
    }
    res.render('index', {
      title: 'Shopping Cart',
      products: doc,
      checkUser: req.isAuthenticated(),
      totalProduct: totalProduct,
      successMassage: successMassage,

    });
  })
});

router.get('/addToCart/:id/:price/:name', (req, res, next) => {

  req.session.hasCart = true;
  const cartID = req.user._id;
  const newProductPrice = parseInt(req.params.price, 10);
  const newProduct = {
    _id: req.params.id,
    price: newProductPrice,
    name: req.params.name,
    quantity: 1,
  };

  //This Function to delete all recourd in DB
  /* Cart.deleteMany((error,doc)=>{
     if(error){
       console.log(error)
     }
     console.log(doc)
   });
   */

  Cart.findById(cartID, (error, cart) => {
    if (error) {
      console.log(error)
    }
    if (!cart) {
      //add new cart to user    
      const newCart = new Cart({
        _id: cartID,
        totalQuantity: 1,
        totalPrice: newProductPrice,
        selectedProduct: [newProduct],
        createAt: Date.now(),
      })

      newCart.save((error, doc) => {
        if (error) {
          console.log(error)
        }
        console.log(doc);
      })
    }
    if (cart) {
      //if the user have cart update it
      var indexOfProduct = -1;
      for (let i = 0; i < cart.selectedProduct.length; i++) {
        if (req.params.id === cart.selectedProduct[i]._id) {
          indexOfProduct = i;
          break;
        }
      }
      if (indexOfProduct >= 0) {
        cart.selectedProduct[indexOfProduct].quantity = cart.selectedProduct[indexOfProduct].quantity + 1;
        cart.selectedProduct[indexOfProduct].price = cart.selectedProduct[indexOfProduct].price + newProductPrice;
        cart.totalQuantity = cart.totalQuantity + 1;
        cart.totalPrice = cart.totalPrice + newProductPrice;
        cart.createAt = Date.now();
        console.log(userCart);

        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error)
          }
          console.log(doc);
          console.log(cart);
        })
      }
      else {
        cart.totalQuantity = cart.totalQuantity + 1;
        cart.totalPrice = cart.totalPrice + newProductPrice;
        cart.selectedProduct.push(newProduct);
        cart.createAt = Date.now();
        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error)
          }
          console.log(doc);
          console.log(cart);
        })
      }
    }
  })

  res.redirect('/')
})

router.get('/shopping-cart', (req, res, next) => {
  //check if user login
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin');
    return
  }
  console.log(req.session.hasCart);
  //check if user have cart 
  if (!req.user.cart) {
    res.render('shopping-cart', { checkUser: true, hasCart: req.session.hasCart, totalProduct: 0 });
    req.session.hasCart = false;
    return
  }
  const userCart = req.user.cart;
  const totalProduct = req.user.cart.totalQuantity;
  res.render('shopping-cart', { userCart: userCart, checkUser: true, totalProduct: totalProduct });
});
router.get('/increaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrice = userCart.selectedProduct[index].price / userCart.selectedProduct[index].quantity;
    userCart.selectedProduct[index].quantity += 1;
    userCart.selectedProduct[index].price += productPrice;
    userCart.totalQuantity += 1;
    userCart.totalPrice = userCart.totalPrice + productPrice;
    userCart.createAt = Date.now();
    console.log(userCart);

    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
      if (error) {
        console.log(error)
      }
      console.log(doc);
      res.redirect('/shopping-cart')
    })
  } else {
    res.redirect('/shopping-cart');
  }


});

router.get('/decreaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrice = userCart.selectedProduct[index].price / userCart.selectedProduct[index].quantity;
    userCart.selectedProduct[index].quantity -= 1;
    userCart.selectedProduct[index].price -= productPrice;
    userCart.totalQuantity -= 1;
    userCart.totalPrice = userCart.totalPrice - productPrice;
    userCart.createAt = Date.now();
    console.log(userCart);
    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
      if (error) {
        console.log(error)
      }
      console.log(doc);
      res.redirect('/shopping-cart')
    })
  } else {
    res.redirect('/shopping-cart');
  }

});
router.get('/deleteProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    if (userCart.selectedProduct.length <= 1) {
      Cart.deleteOne({ _id: userCart._id }, (error, doc) => {
        if (error) {
          console.log(error)
        }
        console.log(doc)
        res.redirect('/shopping-cart');
      })

    }
    else {
      userCart.totalPrice -= userCart.selectedProduct[index].price;
      userCart.totalQuantity -= userCart.selectedProduct[index].quantity;
      userCart.selectedProduct.splice(index, 1);
      userCart.createAt = Date.now();
      console.log(userCart);
      Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
        if (error) {
          console.log(error)
        }
        console.log(doc)
        res.redirect('/shopping-cart');
      })
    }
  } else {
    res.redirect('/shopping-cart')
  }

});
router.get('/check-out', (req, res, next) => {
  
  if (req.user.cart) {
    const errorMassage = req.flash('error')[0];
    if(req.user.userName===undefined || req.user.address===undefined || req.user.contact===undefined){
      req.flash('profileError', ['please update your info befor check out the order']);
      res.redirect('/users/profile');
      return;
    }
    res.render('check-out', {
      checkUser: true,
      totalPrice: req.user.cart.totalPrice,
      totalProduct: req.user.cart.totalQuantity,
      errorMassage: errorMassage,
      user:req.user
    })
  }
  else {

    res.redirect('/shopping-cart')
  }
});

router.post('/checkout', (req, res, next) => {
  stripe.charges.create({
    amount: req.user.cart.totalPrice * 100,
    currency: 'usd',
    source: req.body.stripeToken,
    description: 'Send to test@mail.com'
  },
    function (error, charges) {
      if (error) {
        console.log(error.message);
        req.flash('error', error.message);
        res.redirect('/check-out');
      }

      console.log(charges);
      req.flash('success', 'Successfuly bought Product !!');
      const order = new Order({
        user: req.user._id,
        cart: req.user.cart,
        address: req.body.address,
        name: req.body.name,
        contact:req.body.contact,
        paymentId: charges.id,
        orderPrice: charges.amount / 100,
      });
      order.save((error, result) => {
        if (error) {
          console.log(error);
        }
        console.log(result);
        Cart.deleteOne({ _id: req.user.cart._id }, (error, doc) => {
          if (error) {
            console.log(error);
          }
          console.log(doc)
          res.redirect('/');
        })
      })
    }
  );

});

module.exports = router;









