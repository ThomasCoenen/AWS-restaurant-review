//https://github.com/Sanjeev-Thiyagarajan/PERN-STACK-DEPLOYMENT

//ssh -i defaultKeyPair.pem ubuntu@34.230.64.110  ///connect to instance
//sudo apt update && sudo apt upgrade -y   //Update packages
//sudo apt install postgresql postgresql-contrib -y  //install PostgreSQL
//whoami //unbuntu - shows username of whos logged in
//sudo cat /etc/passwd   //shows users on your local operating system
//sudo -i -u postgres //switch to postgres user
//psql  // now logged in to postgres db and INSIDE SHELL 
//  \l  //shows lists of DBs

//create a user called ubuntu in the DB
//  \q  // quite out of postgres 
//createuser --interactive   //set up new user
//ubuntu
// y   //yes for superuser - full privaleges 
//psql //login to postgre_sql
// \du   //shows u all the users (postgres & ubuntu user)
//exit

//login to postgres
// psql  //still cant login to
// psql -d postgres    // will log u in as Ubuntu User
//  \conninfo   //shows u connection info
    //get : You are connected to database "postgres" as user "ubuntu" via socket in "/var/run/postgresql" at port "5432".

//create password for ubuntu user in postgres
// ALTER USER ubuntu PASSWORD 'yourPWHere';

//recreate DB schema - use PG dump where you can dump DB schema & u can import it into 
//another instance of postgres. can dump DB Schema & Data in the schema as well

//in localMachine Term(not ubuntu server, did mine on server dir) : 
//pg_dump -U postgres -f yelp.pgsql -C yelp   //yelp=DB name
//ls  //can so see yelp.pgsql file 

//copy yelp.pgsql to production server. just place PEM file in this dir for now
//scp -i defaultKeyPair.pem yelp.pgsql ubuntu@34.230.64.110:/home/ubuntu/

//SSH back into ubuntu server & into directory where we added the yelp.pgsql
// cd ~  //takes u to home dir
//ls   // can see yelp.pgsql file

//import yelp.pgsql into the DB. must manually create the DB first
//psql -d postgres
//create database yelp;
// \l   //verify that the DB was created 
// \q

//Import the database schema & data from the yelp.pgsql file
// psql yelp < /home/ubuntu/yelp.pgsql

//connect back into yelp DB
//psql -d yelp
// \d   //check to see if all your tables were added
//select * from restaurants;   //check a table to make sure everything copied over
//DONE SETTING UP POSTGRES!! POSTGRES RUNNING ON DEFAULT PORT 5432




//Next Step - copy app code on to production server







require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); //looks for index.js automatically

// const morgan = require("morgan");  //middleware

const app = express();
app.use(cors());
app.use(express.json());   //allows to parse body in get requests

// Get all Restaurants
app.get("/get-restaurants", async (req, res) => {
  try {
    const allRestaurants = await db.query("SELECT * FROM restaurants");
    // console.log("resultsAllRestaurants:",allRestaurants)

    //avg rating for individual restuarant:
    const restaurantRatingsData = await db.query("select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;");
    console.log("restaurantRatingsData:",restaurantRatingsData)

    res.status(200).json({
      status: "success",
      results: restaurantRatingsData.rows.length,
      data: {
        restaurants: restaurantRatingsData.rows,
      },
    });
  } catch (err) {console.log(err);}
});

//Get single Restaurant
app.get("/single-restaurant/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const restaurant = await db.query(     //has avg of individual restaurant
      "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1",
      [req.params.id]
    );
    // const restaurant = await db.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id])   
    // console.log("restaurant:",restaurant.rows[0])
    const reviews = await db.query( "select * from reviews where restaurant_id = $1", [req.params.id]);
    console.log("reviews:",reviews);

    res.status(200).json({
      status: "success",
      data: {
        restaurant: restaurant.rows[0],
        reviews: reviews.rows,
      },
    });
  } catch (err) {console.log(err);}
});

// Create a Restaurant
app.post("/create-restaurant", async (req, res) => {
  console.log(req.body);
  try {
    const results = await db.query(
      "INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3) returning *",  //returning * returns newly enerted data
      [req.body.name, req.body.location, req.body.price_range]
    );
    console.log("results:",results);
    res.status(201).json({
      status: "success",
      data: {
        restaurant: results.rows[0],
      },
    });
  } catch (err) {console.log(err);}
});

// Update Restaurants
app.put("/update-restaurant/:id", async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE restaurants SET name = $1, location = $2, price_range = $3 where id = $4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.params.id]
    );
    console.log("results:",results);
    res.status(200).json({
      status: "succes",
      data: {
        retaurant: results.rows[0],
      },
    });
  } catch (err) {console.log(err);}
});

// Delete Restaurant
app.delete("/delete-restaurant/:id", async (req, res) => {
  try {
    const results = db.query("DELETE FROM restaurants where id = $1", [
      req.params.id,
    ]);
    res.status(204).json({
      status: "sucess",
    });
  } catch (err) {console.log(err);}
});

app.post("/addReview/:id", async (req, res) => {
  try {
    const newReview = await db.query(
      "INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *;",
      [req.params.id, req.body.name, req.body.review, req.body.rating]
    );
    console.log("newReview:",newReview);
    res.status(201).json({
      status: "success",
      data: {
        review: newReview.rows[0],
      },
    });
  } catch (err) {console.log(err);}
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`server is up and listening on port ${port}`);
});
