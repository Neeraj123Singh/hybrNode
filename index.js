const express = require('express');
const app= express();
app.use(express.json());
app.use(require('./router/auth'));
//models




app.listen(3001, ()=>{
    console.log("Server listening at port 3001");
})