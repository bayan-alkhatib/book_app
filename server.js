'use strict';
require('dotenv').config();
const express=require('express');
const superagent=require('superagent');
const cors= require('cors');


const PORT=process.env.PORT || 3000;
const server=express();
server.use(cors());
server.set('view engine','ejs');
server.use(express.static('./public'));
server.use(express.urlencoded({extended:true}));



function booksSearchHand (req,res){
  let bookSearchInput=req.body.search_query;
  let search=req.body.search_fields;
  let bookUrl=`https://www.googleapis.com/books/v1/volumes?q=+${bookSearchInput}:${search}`;
  superagent.get(bookUrl)
    .then(booksData=>{
      let volumeInfoArr=booksData.body;
      let newBookInstance= volumeInfoArr.items.map(element=>{
        console.log (new BOOKS(element));
        return new BOOKS(element);
      });
      res.render('searches/show',{bookinstance:newBookInstance});
    })
    .catch(()=>{
      res.render('pages/error');
    });
}



server.get('/',(req,res)=>{
  res.render('pages/index');
});

server.get('/new',(req,res)=>{
  res.render('searches/new');
});

server.post('/searches',booksSearchHand );


server.get('*', (req,res)=>{
  res.render('pages/error');
});


function BOOKS(value) {
  this.image_url=value.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title=value.volumeInfo.title || 'Not Found';
  this.author=value.volumeInfo.authors || 'Not Found';
  this.descripition=value.volumeInfo.description || 'Not Found';
}


server.listen(PORT, ()=>{
  console.log(`listen to port ${PORT}`);
});

