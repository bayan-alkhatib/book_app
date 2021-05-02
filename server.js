'use strict';
const express=require('express');
const superagent=require('superagent');
require('dotenv').config();
const cors= require('cors');

const server=express();
const PORT=process.env.PORT || 3000;
server.use(cors);
server.set('view engine','ejs');
server.use(express.static('./public'));

server.get('/hello',(req,res)=>{
  res.send('Iam from the server side');
});

server.listen(PORT, ()=>{
  console.log(`listion to port ${PORT}`);
});

