DROP TABLE IF EXISTS books;

create table  books (
    id SERIAL PRIMARY KEY,
    title  VARCHAR(255),
    author  VARCHAR(255),
    isbn  VARCHAR(255),
    image_url VARCHAR(500) ,
    description  TEXT,
    bookshelf VARCHAR(255)
);

