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
const destUrl = ["paris","bali","annapurna","inca","rome","santorini"];
const destName = ["Paris","Bali Island","Annapurna Circuit","Inca Trail to Machu Picchu","Rome","Santorini Island"];
var MongoClient = require('mongodb').MongoClient;

//useful functions:

function loginUser(user, res,req) {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("myDB");
    db.collection("myCollection").find().toArray((err, results) => {
      if (err) throw err;
      var inDB = false;
      results.forEach((result) => {
        if (result.username == user.username) {
          inDB = true;
          if (result.password == user.password) {
            req.session.user = result;
            res.redirect("/home");
          } else {
            alert("wrong password");
            //throw error for wrong pass;
          }
        }
      });
      if (inDB == false) {
        alert("user is not defined");
        //throw error for not being registered
      }
    });
  });
};

function insertIntoDB(req, res) {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("myDB");
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
      db.collection("myCollection").find().toArray((err, results) => {
        if (err) throw err;
        var inDB = false
        results.forEach((result) => {
          if (result.username == user.username) {
            //throw error 
            alert("user is already defined");
            inDB = true;
          }
        });
        if (inDB == false) {
          alert("registration is successful");
          db.collection("myCollection").insertOne(user);
          res.redirect("/");
        }
      });
    } 
  });
};

function updateUserWantToGo(req,destination){
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;
    var db = client.db("myDB");
    if(req.session.user.want_to_go.includes(destination)){
      alert(destination + " is already in your want_to_go list");
    }else{
      req.session.user.want_to_go.push(destination);
      req.session.save();
      db.collection("myCollection").updateOne({username:req.session.user.username},{$set:{want_to_go:req.session.user.want_to_go}});
      db.collection("myCollection").findOne({username:req.session.user.username},(err,data)=>{
        req.session.user = data;
        req.session.save();
      });
      // req.session.user = db.collection("myCollection").findOne({username:req.session.user.username});
    }
  })
}

function searches(x){
  var temp = [];
  var tempUrl = [];

  for(var i=0;i<destName.length;i++){
    if(destName[i].toLowerCase().includes(x.toLowerCase())){
      temp.push(destName[i]);
      tempUrl.push(destUrl[i]);  
    } 
  }
  if(temp.length==0)
    alert("not found");
  return {t:temp,u:tempUrl};
}

function isAuthenticated(req,res,next){
  if(req.session.user) return next();
  else res.redirect("/");
}


//Login page:
//get the login page
app.get('/', (req, res) => {
  if(req.session.user){
    delete req.session.user;
  }
  res.render("login.ejs")
});

//check the user's credentials
app.post('/', (req, res) => {
  var x = req.body.username
  var y = req.body.password
  if( x == "admin" && y =="admin" ){
    req.session.user = {username:"admin",password:"admin",want_to_go:[]};
    req.session.save();
    res.redirect("/home");
  }else{
    loginUser(req.body, res,req);
  }
});

//---------------------------------------------------------

//Register page:
// go to register page
app.get('/registration', (req, res) => {
  if(req.session.user){
    delete req.session.user;
  }
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
  res.render("searchresults.ejs",{dests:temp["t"],du:temp["u"]})
});

//----------------------------------------------------------
// Add to want_to_go list
// add inca
app.post('/inca', (req, res) => {
  updateUserWantToGo(req,"Inca Trail to Machu Picchu");
  res.redirect("/inca");
});

// add annapurna
app.post('/annapurna', (req, res) => {
  updateUserWantToGo(req,"Annapurna Circuit");
  res.redirect("/annapurna");
});

// add paris
app.post('/paris', (req, res) => {
  updateUserWantToGo(req,"Paris");
  res.redirect("/paris");
});

// add rome
app.post('/rome', (req, res) => {
  updateUserWantToGo(req,"Rome");
  res.redirect("/rome");
});

// add bali
app.post('/bali', (req, res) => {
  updateUserWantToGo(req,"Bali Island");
  res.redirect("/bali");
});

// add santorini
app.post('/santorini', (req, res) => {
  updateUserWantToGo(req,"Santorini Island");
  res.redirect("/santorini");
});


const PORT = process.env.PORT || 3030;

// your code

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

//app.listen(3000);