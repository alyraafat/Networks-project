var express = require('express');
var path = require('path');
var app = express();
const uri = "mongodb://127.0.0.1:27017";


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//useful functions:
var MongoClient = require('mongodb').MongoClient

function loginUser(user, res) {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("NetworksDB");
    db.collection("users").find().toArray((err, results) => {
      if (err) throw err;
      var inDB = false;
      results.forEach((result) => {
        if (result.username == user.username) {
          inDB = true;
          console.log("user is already defined,login")
          if (result.password == user.password) {
            res.render("home.ejs");
          } else {
            console.log("wrong pass");
            //throw error for wromng pass;
          }
        }
      });
      if (inDB == false) {
        console.log("user is not defined,login")
        //throw error for not being registered
      }
    });
  });
}
function insertIntoDB(req, res) {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("NetworksDB");

    var user = {
      username: req.body.username,
      password: req.body.password,
      want_to_go: []
    }
    db.collection("users").find().toArray((err, results) => {
      if (err) throw err;
      var inDB = false
      results.forEach((result) => {
        if (result.username == user.username) {
          console.log("user is already defined,register")
          //throw error 
          inDB = true;
        }
      });
      if (inDB == false) {
        db.collection("users").insertOne(user);
        res.redirect("/");
      }
    });
  });
}
//Login page:
//get the login page
app.get('/', (req, res) => {
  res.render("login.ejs")
})

//check the user's credentials
app.post('/', (req, res) => {
  loginUser(req.body, res);
})

//---------------------------------------------------------

//Register page:
// go to register page
app.get('/registration', (req, res) => {
  res.render("registration.ejs")
})

// register the user
app.post('/register', (req, res) => {
  insertIntoDB(req, res);
})

//----------------------------------------------------------

// WANT_TO_GO page:
app.get('/wanttogo', (req, res) => {
  res.render("wanttogo.ejs")
})

//----------------------------------------------------------

// CATEGORIES: 
// 1-get hiking page when clicking on view button under hiking photo
app.get('/hiking', (req, res) => {
  res.render("hiking.ejs")
})

// 2-get cities page when clicking on view button under cities photo
app.get('/cities', (req, res) => {
  res.render("cities.ejs")
})

// 3-get islands page when clicking on view button under islands photo
app.get('/islands', (req, res) => {
  res.render("islands.ejs")
})

//----------------------------------------------------------

// DESTINATIONS:
//1-Hiking destinations:
//1a- get inca page
app.get('/inca', (req, res) => {
  res.render("inca.ejs")
})

//1b- get inca page
app.get('/annapurna', (req, res) => {
  res.render("annapurna.ejs")
})

//2-Cities destinations:
//2a- get inca page
app.get('/paris', (req, res) => {
  res.render("paris.ejs")
})

//2b- get inca page
app.get('/rome', (req, res) => {
  res.render("rome.ejs")
})

//3-Islands destinations:
//3a- get inca page
app.get('/bali', (req, res) => {
  res.render("bali.ejs")
})

//3b- get inca page
app.get('/santorini', (req, res) => {
  res.render("santorini.ejs")
})

app.listen(3000);
