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

// https://www.googleapis.com/books/v1/volumes?q=search+${q}:${search}&maxResults=10`
function booksSearchHand (req,res){
  let bookSearchInput=req.body.search_query;
  let bookUrl=`https://www.googleapis.com/books/v1/volumes?q=${bookSearchInput}&maxResults=10`;
  superagent.get(bookUrl)
    .then(booksData=>{
      let volumeInfoArr=booksData.body.items.volumeInfo;
      let newBookInstance= volumeInfoArr.map(element=>{
        return new BOOKS(element);
      });
      console.log(volumeInfoArr);
      // if(newBookInstance.title===null ) newBookInstance.title='Not Found';
      // if (newBookInstance.author===null) newBookInstance.author='Not Found';
      // if(newBookInstance.descripition===null) newBookInstance.descripition='Not Found';
      // if( newBookInstance.image_url===null) newBookInstance.image_url= 'https://i.imgur.com/J5LVHEL.jpg';
      res.render('Iam working');
      res.render('pages/searches/show',{bookinstance:newBookInstance});
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


function BOOKS(element) {
  this.image_url=element.imageLinks;
  this.title=element.title;
  this.author=element.authors[0];
  this.descripition=element.description;
}


server.listen(PORT, ()=>{
  console.log(`listion to port ${PORT}`);
});

