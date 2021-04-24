//https://www.youtube.com/watch?v=NjYsXuSBZ5U&t=3620s
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
//on Ubuntu server -> create folder in home dir
//pwd  //  get -> /home/ubuntu
// mkdir apps   
// cd apps
// mkdir yelp-app   //create folder where our app code lives
//cd yelp-app

//Add repo to GitHub and copy the URL REPO: AWS-restaurant-review
//git clone https://github.com/ThomasCoenen/AWS-restaurant-review.git

//install node on the ubuntu server
//https://github.com/nodesource/distributions/blob/master/README.md
//install version 14
// curl -fsSL https://deb.nodesource.com/setup_15.x | sudo -E bash -
// sudo apt-get install -y nodejs
 //node --version   //test to make sure node installed 

 //cd AWS-restaurant-review
//cd server
//npm install  //install node_modules
//node server.js  //test to make sure server is running

//never want to run NODE server.js in a production environement. will 
//use PM2 Process Manager instead. PM2 makes sure express app works properly
//https://pm2.keymetrics.io/
//install PM2
//sudo npm install pm2 -g

//start node server with PM2:
//pm2 start server.js   //make sure in right dir


//(dont need to do this but here are other PM2 commands:)
//pm2 stop server.js   //stops server
//pm2 status
//pm2 delete server.js  //deletes process.js

//rename process from server to yelp-app (want a more suitable name than server.js)
//pm2 start server.js --name yelp-app

//Configure PM2 to automatically startup the process after a reboot(in case ubuntu server goes down)
//pm2 startup
//above prints this: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
//Copy above command and run it 
//sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
//pm2 save   //this will remember all processes currently on and power on @ startup

//sudo reboot   //(shuts down server) reboot to verify it doing what its supposed to do
//connect back to server:
//ssh -i defaultKeyPair.pem ubuntu@34.230.64.110
//pm2 status   //make sure process started back up



//Step 3 deploy front end code
//cd client 
//npm install
//npm run build
//ls   //u see its created a build folder
//cd build 


//Step 4 - install NGINX
//cd build
//sudo apt install nginx -y

//configure NGINX to power on automaitcally when server reboots
//sudo systemctl enable nginx
//systemctl status nginx   //verify it worked. make sure it says enabled. this makes sure whenever machine reloads it automatically brings NGINX server online

//Configure NGINX Webs Server
//cd ~   //back to home dir
//cd /etc/nginx/
//cd sites-available/
//ls   //we see have DEFAULT 
//any HTTP req that gets sent to NGINX gets processed by DEFAULT server block

//Configure AWS instance to allow HTTP traffic
//Go on AWS and click on Security Group for your EC2 Instance you are running
//Modify the Inbound Rules
//Add 2 rules: HTTP and HTTPS, both from anywhere (0.0.0.0/0)

//Open up IP address in browser:
//34.230.64.110
//if success will see HTML message thar NGINX installed properly. this all being handled by the DEFAULT server block

//check out the DEFAULT server block(optional)
//cat default   //shows u a few things about the default server block
//this line shows NGINX server which HTML file to return to client: root /var/www/html;  
//take a look at his files
//cd /var/www/html/
//ls    //index.nginx-debian.html
// cat index.nginx-debian.html   //will show the HTML markup of the file NGINX serves to us

//cd~
//cd /etc/nginx/sites-available

// create new file (use same name as domain name - just made up this domain name for now since i dont have one) 
//copy DEFAULT file
//sudo cp default restaurant-reviewer.xyz //cp = copy
//ls  //now u see restaurant-reviewer.xyz

//make changes for this new file(1:06:00 (time part))
//sudo vi restaurant-reviewer.xyz  //vi is a text editor 
//IN THIS FILE:
//pass in location of Build folder:
  // root /home/ubuntu/apps/yelp-app/AWS-restaurant-review/client/build;
//since dont have a domain name can just put in IP address
  //server_name 34.230.64.110;
//Pass in this for front end requests
  // location / {
  //   try_files $uri /index.html;
  // }

//enable the changes 
//sudo ln -s /etc/nginx/sites-available/restaurant-reviewer.xyz /etc/nginx/sites-enabled/
//sudo systemctl restart nginx  // so changes can take effect

//Now TEST OUT SITE: 34.230.64.110 (past IP in browser)
//The Front End portion now works. Now need to set up NGINX to process Backend 



//Configure Backend Portion  -> GO BACK AND DO THIS PART
//sudo vi restaurant-reviewer.xyz 
//Place this is file, so anything w/ /api will get routed here (backend requests): 
// location /api {
//   proxy_pass http://localhost:3001;
//   proxy_http_version 1.1;
//   proxy_set_header Upgrade $http_upgrade;
//   proxy_set_header Connection 'upgrade';
//   proxy_set_header Host $host;
//   proxy_cache_bypass $http_upgrade;
// }
//sudo systemctl restart nginx  // so changes can take effect


//Set up Environement Variables. set w/ word: export KEY="value"
//export TEST="hello"  //just an example
//printenv   //prints out all env vars 
//printenv | grep -i test   //to look for specific ENV var -> -i ignores case
//unset TEST   //remove ENV var (its case sensitive)

//Put all our Project ENV Vars in. Load up file to do so since we have quite a few
//DO NOT PUT THIS FILE IN THE SAME DIRECTORY AS YOUR APPLICATION CODE!!
// cd ~
//Create a file .env (location doesnt matter)
// vi .env   //creates the .env file
//Make sure to put 'export' keyword in front and put values in quotes like above
//sorce .env    //2nd part is path to file(we are in current dir)
//printenv | grep -i pg   //grab anything that starts w/ pg

//One more modification we can do w/ ENV vars.  BEST WAY!
//Clear out all the ENV vars in the file and copy them as u have in your .env file on your local server
// vi .env //opens .env file to do above
//This command will easily add the 'export' keyword and put quotes around the value
//set -o allexport; source .env; set +o allexport
//cat .env

//One Issue w/ ENV Vars - ENV vars wont persist @ reload so if our machine reloaded app would crash and ENV vars would be gone
//Run this so ENV Vars get loaded on reboot
// ls -la   //prints out all files including hidden files 
//There are 2 files need to modify to make sure ENV Vars get loaded on reboot: .profile & .bashrc

//Modify .profile  (1:28:00)
//vi .profile 
//Go to bottom of file and add this:
//set -o allexport; source /home/ubuntu/.env; set +o allexport

//Techincally current seshion wont have ENV Vars but if u quit out and reboot it will
//printenv | grep -i pg    // we see ENV vars not there
//exit 
// ssh -i defaultKeyPair.pem ubuntu@34.230.64.110    //reconnect
//printenv | grep -i pg   // env vars now set 


//MAKE SURE TO CHANGE PGUSER=ubuntu!!!!!!!!  (INSTEAD OF postgres)
//vi .env

//Reboot to make sure changes take effect
//exit
// ssh -i defaultKeyPair.pem ubuntu@34.230.64.110    //reconnect
//printenv | grep -i pg   //make sure changes persisted


//Next Step - Set up Firewall for Ubuntu Server
//This is an extra layer of security, in case u deploy on another place other than AWS
//Make sure u only allow 3 types of traffic (same 3 types we added on AWS rules)

//To work w/ a Firewall use service called UFW. Want to enable certain Firewall rules
// sudo ufw status   // we see inactive 
//sudo ufw allow ssh 
//sudo ufw allow http 
//sudo ufw allow https 
//sudo ufw enable    //to enable all the updated rules
//sudo ufw status   //now we see its active

//Final Step - Set up SSL
//if u look at app now, Chrome says its NOT SECURE. This is bc it's using HTTP which is port 80 and is not secure or encrypted. U want the Green padlock.
//Everything automatically redirected to HTTPS and will make site secure
//Will use Certbot. this configures NGINX for us
//https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx.html
//sudo snap install --classic certbot    //Install Certbot
//sudo ln -s /snap/bin/certbot /usr/bin/certbot   //Prepare the Certbot command
//sudo certbot --nginx   //Get and install certificates using interactive prompt. Place valid email in. 
//FOR ABOVE STEP CANT JUST ADD IP ADDRESS FOR DOMAIN -> I MAY NEED T0 GET A DOMAIN NAME

//Check out congig changes that were made to NGINX 
//cd /etc/nginx/sites-available
// cat restaurant-reviewer.xyz



//Still Cant Access Database - lets fix this
//Inspect Page - Network - Refresh
//We see making request to /get-restaurants, but am not getting a response back

//Check the Logs
// pm2 logs  //we see the authentication failurefor connection to the DB
//printenv | grep -i pg    //check that ENV Vars were set

//May have to restart PM2 
//pm2 restart 0

//Refresh Website in Chrome and see if fixed











require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); //looks for index.js automatically

// const morgan = require("morgan");  //middleware

const app = express();
app.use(cors());
app.use(express.json());   //allows to parse body in get requests

// Get all Restaurants
app.get("/api/get-restaurants", async (req, res) => {
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
app.get("/api/single-restaurant/:id", async (req, res) => {
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
app.post("/api/create-restaurant", async (req, res) => {
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
app.put("/api/update-restaurant/:id", async (req, res) => {
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
app.delete("/api/delete-restaurant/:id", async (req, res) => {
  try {
    const results = db.query("DELETE FROM restaurants where id = $1", [
      req.params.id,
    ]);
    res.status(204).json({
      status: "sucess",
    });
  } catch (err) {console.log(err);}
});

app.post("/api/addReview/:id", async (req, res) => {
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
