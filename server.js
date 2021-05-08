'use strict';

// Application Dependencies
const express=require('express');
const superagent=require('superagent');
const cors= require('cors');
const methodOverride=require('method-override');
const pg= require('pg');

// Environment variables
require('dotenv').config();

// Application Setup
const PORT=process.env.PORT || 3000;
const server=express();
server.use(cors());

// Express middleware
// Specify a directory for static resources
server.use(express.static('./public'));
//put the form data in req.body
server.use(express.urlencoded({extended:true}));
//to use update and delete
server.use(methodOverride('_method'));

// Set the view engine for server-side templating
server.set('view engine','ejs');

// Database Setup
let client = new pg.Client({ connectionString:process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});


//Routes
server.get('/',homePageHandeler);
server.post('/searches/show',booksSearchHand);
server.post('/book',selectedBookHand);
server.get('/book/:id',idbookhandeler);
server.put('/update/:id',updateHand);
server.delete('/delete/:id',deleteBookHand);
server.get('/new',(req,res)=>{
  res.render('searches/new');
});
server.get('*',errorfun);


//Handeler Funcrions
function homePageHandeler (req,res){
  let sql=`select * from books;`;
  client.query(sql)
    .then (result=>{
      res.render('pages/index',{books:result.rows});
    });
}

function booksSearchHand (req,res){
  let bookSearchInput=req.body.search_query;
  let search=req.body.search_fields;
  let bookUrl=`https://www.googleapis.com/books/v1/volumes?q=+${bookSearchInput}:${search}`;
  superagent.get(bookUrl)
    .then(booksData=>{
      let volumeInfoArr=booksData.body;
      let newBookInstance= volumeInfoArr.items.map(element=>{
        return new BOOKS(element);
      });
      res.render('searches/show',{bookinstance:newBookInstance});
    })
    .catch(()=>{
      res.render('error');
    });
}

function selectedBookHand (req,res){
  let {title,author,description,isbn,image_url,bookshelf}=req.body;
  let sql=`insert into books (title,author,description,isbn,image_url,bookshelf) values ($1,$2,$3,$4,$5,$6) Returning *;`;
  let safeValues=[title,author,description,isbn,image_url,bookshelf];
  client.query(sql,safeValues)
    .then(result=>{
      res.redirect(`/book/${result.rows[0].id}`);
    });
}

function idbookhandeler(req,res){
  let sql=`select * from books where id=$1;`;
  let safeValues=[req.params.id];
  client.query(sql,safeValues)
    .then(result=>{
      res.render('pages/books/book',{bookid:result.rows[0]});
    });
}

function updateHand(req,res){
  let data = Object.values(req.body);
  let id = parseInt(data[6]);
  let query = `UPDATE books  SET  title = $1, author = $2, isbn = $3, image_url=$4, description = $5, bookshelf=$6 WHERE id = $7;`;
  client.query(query,data)
    .then(() => {
      res.redirect(`/book/${id}`);
    });
}

function deleteBookHand(req,res){
  let sql=`delete from books where id=$1;`;
  let safeValues=[req.params.id];
  client.query(sql,safeValues)
    .then (()=>{
      res.redirect('/');
    });
}

let errorfun=((req,res)=>{
  res.render('pages/error');
});

// Constructor
function BOOKS(value) {
  this.image_url=value.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title=value.volumeInfo.title || 'Not Found';
  this.author=value.volumeInfo.authors || 'Not Found';
  this.description=value.volumeInfo.description || 'Not Found';
  this.isbn=value.volumeInfo.industryIdentifiers[0].identifier || 'Not Found';
  this.bookshelf=value.volumeInfo.categories|| 'Not Found';
}


client.connect()
  .then(() => {
    server.listen(PORT, ()=>{
      console.log(`listen to port ${PORT}`);
    });
  });
