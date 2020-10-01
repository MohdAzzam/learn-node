const Product = require('../model/product');
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/Shopping-cart',{useNewUrlParser:true,useUnifiedTopology: true},(error)=>{
  if(error){
    console.log(error);
  }
  else{

      console.log('Connected to DB..');
  }
});

const products =
 [
    new Product({
        imagePath: '/images/lg.png',
        productName: 'Iphone 10',
        information: {
            storage: '16 GB',
            ram:4,
            numberOfSim: '1',
            camera: '16 MP',
            displaySize: '6.5 inc'

        },
        price: 400,
    }),
    /*
    new Product({
        imagePath: '/images/googlepixe.png',
        productName: 'Google Pixe',
        information: {
            storage: '6 GB',
            ram:2,
            numberOfSim: 'dual sim',
            camera: '8 MP',
            displaySize: '4.5 inc'

        },
        price: 200,
    }),
    new Product({
        imagePath: '/images/huwawei.png',
        productName: 'Huwawei',
        information: {
            storage: '8 GB',
            ram:6,
            numberOfSim: 'dual sim',
            camera: '24 MP',
            displaySize: '8.5 inc'

        },
        price: 500,
    }),
    new Product({
        imagePath: '/images/samsung.png',
        productName: 'Samsung',
        information: {
            storage: '12 GB',
            ram:8,
            numberOfSim: 'dual sim',
            camera: '24 MP',
            displaySize: '9.5 inc'

        },
        price: 450,
    }),*/

]
var flag=0;
for(var i=0 ;i< products.length;i++){
    products[i].save((error,doc)=>{
        if(error){
            console.log(error);
        }
        flag++;
        console.log(doc);
        if(flag===products.length){ 
            mongoose.disconnect();
        }

    })
}