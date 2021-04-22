--  \?  // shows u all the postgres commands avaiable 
-- \l  //shows lists of DBs

--create database practice;
--\c practice  //connect to a DB
--\d  //lists out all tables


-- CREATE TABLE products (
--     id INT,
--     name VARCHAR(50),
--     price INT,
--     on_sale boolean
-- );

-- \d table_name   //see info about specific table

-- ALTER TABLE table_name ADD COLUMN new_col boolean;  
-- ALTER TABLE table_name DROP COLUMN col_to_drop;
-- DROP TABLE table_name
-- DROP DATABASE practice;









CREATE TABLE restaurants (
    id BIGSERIAL NOT NULL PRIMARY KEY, 
    name varchar(50) NOT NULL,
    location varchar(50) NOT NULL,
    price_range INT NOT NULL check(price_range >= 1 and price_range <= 5)
);

INSERT INTO restaurants (name, location, price_range) values(
    'taco bell', 'atlanta', 4
);

-- SELECT * FROM restaurants;

-- INSERT INTO restaurants (price_range) values(
--     12
-- );

-- DROP TABLE restaurants;

-- UPDATE restaurants SET name='red lobster', location='jackson', price_range=4 WHERE id=2;




CREATE TABLE reviews (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
    name VARCHAR(50) NOT NULL,
    review TEXT NOT NULL,
    rating INT NOT NULL check(
        rating >= 1
        and rating <= 5
    )
);

INSERT INTO reviews (restaurant_id, name, review, rating) values(
    7, 'tim', 'cate st was bad', 1
);

select * from reviews where restaurant_id = 6;

-- select *
-- from restaurants
--     left join(
--         select restaurant_id,
--             count(*),
--             TRUNC(AVG(rating, 1)) as average_rating
--         from reviews
--         group by restaurant_id
--     ) reviews on restaurants.id = reviews.restaurant_id;