const jwt= require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const {Product, User, Cataglog,CatalogProduct,OrderProduct,Order} = require('../models');
router.get('/', (req,res)=>{
    res.send(`Hello World Router`);
});

const secret= 'ASDFGHJKJHGFDFGHJKHDFGHKJLHTFYHGYGGCFYGHVGKHGHVGFTGHBVHGJVGYHGJY';

const isBuyer = async (req,res,next)=>{
    try{

        tokenString = req.headers['authorization'];
        tokenArray = tokenString.split(" ");
        token = tokenArray[1];
        const verifyToken = await jwt.verify(token,secret);
        const rootUser = await User.findOne({where:{id: verifyToken.id}});
        if(!rootUser ){
            res.status(401).send("Not a Buyer");
        }
        if(rootUser.type != 'buyer' ){
            res.status(401).send("Not a Buyer");
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser.id;
        next();
    }catch(err){
        res.status(401).send("Unauthorised: No token Provided");
        console.log(err);
    }
}

const isSeller = async (req,res,next)=>{
    try{

        tokenString = req.headers['authorization'];
        tokenArray = tokenString.split(" ");
        token = tokenArray[1];
        const verifyToken = await jwt.verify(token,secret);
        const rootUser = await User.findOne({where:{id: verifyToken.id}});
        if(!rootUser ){
            res.status(401).send("Not a Seller");
        }
        if(rootUser.type != 'seller' ){
            res.status(401).send("Not a Seller");
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser.id;
        next();
    }catch(err){
        res.status(401).send("Unauthorised: No token Provided");
        console.log(err);
    }
}

let cryptP = async function (password){
        return await bcrypt.hash(password,12);
}


let generateAuthToken = async function (user){
    try{
        let token = jwt.sign({id:user.id},secret);
        user.token = token;
        return token;
    }catch(err){
        console.log("Error Occured");
    }
}

router.post('/register',async (req,res)=>{
    let {name,email,password,type} = req.body;
    if(!name||!email||!password||!type || !['buyer','seller'].includes(type))
    {
        return res.status(422).json({
            "error":"Please Fill all the fileds"
        })
    }
    try{
        password = await cryptP(password);
        const userExist = await User.findOne({where:{email:email}});
        if(userExist){
            return res.status(422).json({error: "Email Already exists"});
        }
        const user = await  User.create({name,email,password,type});
        if(type == 'seller'){
            await Cataglog.create({seller:user.id});
        }
        
        res.status(201).json({mesaage: "user registered successfully"});  
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
    
})

router.post('/login', async (req,res)=>{
    let token;
    try{
        const {email,password} = req.body;
        if(!email || !password){
            res.status(422).json({mesaage: "Fill all fileds"});
        }
        const userLogin  = await User.findOne({where:{email:email}});
        if(userLogin)
        {
            const isMatch =await bcrypt.compare(password,userLogin.password);
            token = await  generateAuthToken(userLogin);
            res.cookie("jwtoken",token,{
                expires:new Date(Date.now()+258920000),
                httpOnly:true
            })
            if(!isMatch){
                res.status(201).json({mesaage: "Invalid Credentials"});
            }
            else
            {
                res.status(201).json({mesaage: "user SignIn successfully",token:token});
            }
        }else
        {
            res.status(400).json({mesaage: "user error"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

//create item
router.post('/createItem',isSeller, async (req,res)=>{
    try{
        const {name,price} = req.body;
        if(!name||!price)
        {
            return res.status(422).json({
                "error":"Please Fill all the fileds"
            })
        }
        const item = await Product.create({name,price});
        res.status(201).json({item:item});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

//createCatalog
router.post('/createCatalog',isSeller, async (req,res)=>{
    try{
        const {items} = req.body;
        if(!items || items.length == 0)
        {
            return res.status(422).json({
                "error":"Invalid Input"
            })
        }
        let catalog = await Cataglog.findOne({where:{seller:req.userId}});
        let item;
        let count =0;
        for(let i=0;i<items.length;i++){
            item = await Product.findOne({where:{id:items[i]}});
            if(item){
                count++;
                await CatalogProduct.create({catalogId:catalog.id,productId:item.id})
            }
            
        }
        res.status(201).json({message:`${count} out of ${items.length} items added to catalog`});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

//createOrder

//createCatalog
router.post('/createOrder',isBuyer, async (req,res)=>{
    try{
        const {items , sellerId} = req.body;
        if(!items || !sellerId || items.length == 0)
        {
            return res.status(422).json({
                "error":"Invalid Input"
            })
        }
        let order = await Order.create({seller:sellerId,buyerId:req.userId});
        let item;
        let count =0;
        for(let i=0;i<items.length;i++){
            item = await Product.findOne({where:{id:items[i]}});
            if(item){
                count++;
                await OrderProduct.create({orderId:order.id,productId:item.id})
            }
            
        }
        res.status(201).json({order:order, message:`${count} out of ${items.length} items added to the order created`});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})


//get

router.get('/getCatalog', isBuyer ,async (req,res)=>{
    try{
        const {sellerId} = req.body;
        if(!sellerId)
        {
            return res.status(422).json({
                "error":"Invalid Input"
            })
        }
        let seller = await User.findOne({where:{id:sellerId}});
        if(!seller) res.status(400).json({mesaage: "seller not found"});
        let catalog = await Cataglog.findOne({where:{seller:sellerId}});
        let catalogProducts = await CatalogProduct.findAll({where:{catalogId:catalog.id}});
        let items = [];
        for(let i=0;i<catalogProducts.length;i++){
            items.push(await Product.findOne({where:{id:catalogProducts[i].productId}}));
        }
        res.status(200).json({catalog:{id:catalog.id},items});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

router.get('/getAllOrders', isSeller ,async (req,res)=>{
    try{
        let orders = await Order.findAll({where:{seller:req.userId}, include: [OrderProduct]});
        res.status(200).json({orders});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

router.get('/getAllSellers', isBuyer,async (req,res)=>{
    try{
        const sellers = await User.findOne({where:{type:'sellers'}});
        res.status(200).json({sellers:sellers});
    }catch(err){
        console.log(err);
        res.status(500).json({mesaage: "something went wrong"});
    }
})

module.exports =router;
