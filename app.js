var express = require('express');
var path = require('path');
var alert = require('alert');
var url = require('url');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();
const uri = "mongodb://127.0.0.1:27017";


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(
  session({
    resave:true,
    saveUninitialized:true,
    secret:"secret"
  })
);
const dest = ["paris","bali","annapurna","inca","rome","santorini"];
const nav = ["/paris","/bali","/annapurna","/inca","/rome","/santorini"];
//useful functions:
var MongoClient = require('mongodb').MongoClient;
function loginUser(user, res,req) {
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
            req.session.user = result;
            res.redirect("/home");
          } else {
            console.log("wrong pass");
            alert("wrong pass");
            //throw error for wrong pass;
          }
        }
      });
      if (inDB == false) {
        console.log("user is not defined,login");
        alert("user is not defined,login");
        //throw error for not being registered
      }
    });
  });
};

function insertIntoDB(req, res) {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("NetworksDB");
    if(req.body.username==''){
      alert("username field is empty");
    }else if(req.body.password==''){
      alert("password field is empty");
    }else{
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
            console.log("user is already defined,register");
            //throw error 
            alert("user is already defined,register");
            inDB = true;
          }
        });
        if (inDB == false) {
          alert("registration is successful");
          db.collection("users").insertOne(user);
          res.redirect("/");
        }
      });
    } 
  });
};

function updateUserWantToGo(req,destination){
  MongoClient.connect(uri, (err, client) => {
    console.log("yay1");
    if (err) throw err;
    var db = client.db("NetworksDB");
    console.log(req.session.user);
    if(req.session.user.want_to_go.includes(destination)){
      alert(destination + " is already in your want_to_go list");
    }else{
      console.log("yay");
      req.session.user.want_to_go.push(destination);
      db.collection("users").updateOne({username:req.session.user.username},{$set:{want_to_go:req.session.user.want_to_go}});
      db.collection("users").findOne({username:req.session.user.username},(err,data)=>{
        req.session.user = data;
        req.session.save();
      });
      // req.session.user = db.collection("users").findOne({username:req.session.user.username});
    }
  })
}

function searches(x){
  var temp = [];

  for(var i=0;i<dest.length;i++){
    if(dest[i].includes(x.toLowerCase()))
      temp.push(dest[i]);  
  }
  if(temp.length==0)
    alert("not found");
  return temp;
}

function isAuthenticated(req,res,next){
  if(req.session.user) return next();
  else res.redirect("/");
}


//Login page:
//get the login page
app.get('/', (req, res) => {
  if(req.session.user){
    //console.log(req.session);
    delete req.session.user;
  }
  res.render("login.ejs")
});

//check the user's credentials
app.post('/', (req, res) => {
  loginUser(req.body, res,req);
});

//---------------------------------------------------------

//Register page:
// go to register page
app.get('/registration',isAuthenticated, (req, res) => {
  res.render("registration.ejs")
});

// register the user
app.post('/register',(req, res) => {
  insertIntoDB(req, res);
});

//----------------------------------------------------------
// Home page:
app.get('/home', isAuthenticated,(req, res) => {
  res.render("home.ejs")
});

//----------------------------------------------------------

// WANT_TO_GO page:
app.get('/wanttogo',isAuthenticated, (req, res) => {
  console.log(req.session);
  console.log(req.cookies);
  console.log("----------------");
  res.render("wanttogo.ejs",{data:req.session.user.want_to_go})
});

//----------------------------------------------------------

// CATEGORIES: 
// 1-get hiking page when clicking on view button under hiking photo
app.get('/hiking', isAuthenticated,(req, res) => {
  res.render("hiking.ejs")
});

// 2-get cities page when clicking on view button under cities photo
app.get('/cities',isAuthenticated, (req, res) => {
  res.render("cities.ejs")
});

// 3-get islands page when clicking on view button under islands photo
app.get('/islands',isAuthenticated, (req, res) => {
  res.render("islands.ejs")
});

//----------------------------------------------------------

// DESTINATIONS:
//1-Hiking destinations:
//1a- get inca page
app.get('/inca', isAuthenticated,(req, res) => {
  //  console.log(url.parse('http://localhost:3000/inca',true).pathname.split("/")[1]);
  res.render("inca.ejs")
});

//1b- get annapurna page
app.get('/annapurna', isAuthenticated,(req, res) => {
  res.render("annapurna.ejs")
});

//2-Cities destinations:
//2a- get inca page
app.get('/paris', isAuthenticated,(req, res) => {
  res.render("paris.ejs")
});

//2b- get rome page
app.get('/rome', isAuthenticated,(req, res) => {
  res.render("rome.ejs")
});

//3-Islands destinations:
//3a- get bali page
app.get('/bali', isAuthenticated,(req, res) => {
  res.render("bali.ejs")
});

//3b- get santorini page
app.get('/santorini', isAuthenticated,(req, res) => {
  res.render("santorini.ejs")
});

//----------------------------------------------------------
//Search page:
app.get('/search',isAuthenticated,(req,res)=>{
  res.render('searchresults.ejs');
})
app.post('/search', (req, res) => {
  var x = req.body.Search;
  var temp =searches(x);
  res.render("searchresults.ejs",{dests:temp})
});

//----------------------------------------------------------
// Add to want_to_go list
// add inca
app.post('/inca', (req, res) => {
  console.log("post");
  updateUserWantToGo(req,"inca");
  res.redirect("/inca");
});

// add inca
app.post('/inca', (req, res) => {
  updateUserWantToGo(req,"inca");
  res.redirect("/inca");
});

// add annapurna
app.post('/annapurna', (req, res) => {
  updateUserWantToGo(req,"annapurna");
  res.redirect("/annapurna");
});

// add paris
app.post('/paris', (req, res) => {
  updateUserWantToGo(req,"paris");
  res.redirect("/paris");
});

// add rome
app.post('/rome', (req, res) => {
  updateUserWantToGo(req,"rome");
  res.redirect("/rome");
});

// add bali
app.post('/bali', (req, res) => {
  updateUserWantToGo(req,"bali");
  res.redirect("/bali");
});

// add santorini
app.post('/santorini', (req, res) => {
  updateUserWantToGo(req,"santorini");
  res.redirect("/santorini");
});



app.listen(3000);
