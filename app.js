const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utitiy/wrapAsync.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const flash = require('connect-flash');
const Review = require('./models/review'); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require('express-session');
const { error } = require("console");
const{isLoggedIn} = require("./middlewarer.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to db");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}




// const loggedIn = true;
// All links is here.....
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// flash show 
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.use(passport.initialize());
app.use(passport.session());

// part of user data // session & passport .....
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// New middleware to set auth status for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// "/" meaning is when you can write on the web "localhost:8080/"   
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
let { error } = listingSchema.validate(req.body);
if (error) {
  let errMsg = error.details.map((el) => el.message).join(",");
  throw new ExpressError(400, errMsg);

}else {
  next();
}
};




// ----------- this is user login - logout page  section---------------

//this get Signup form user

// app.get('/', (req, res) => {
//   res.render('navbar', { loggedIn: req.isAuthenticated() });
// });





  app.get('/signup', (req, res) => {
    res.render('user/signUp');
  });
app.post('/submitForm', async(req, res) => {
    let { username, email, password } = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", " registration completed ");
    res.redirect('/login');
  });

// loggin page 
app.get('/login', (req, res) => {
  res.render('user/login');
});

app.post('/login',   passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}), 
async(req, res) => {
  req.flash("success", "welcome to wandulust ");
  res.redirect("/listings");
});

//  log-out page 
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if(err) {
      next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings")
  })
})


// -------------this is listing routes section --------------
//Index Route
app.get("/listings", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  });
  
//New Route
app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});



//Show Route
app.get("/listings/:id", wrapAsync (async (req, res) => {

const { id } = req.params;
const listing = await Listing.findById(id).populate('reviews');

    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
}));


//Create Route
app.post("/listings", isLoggedIn,
wrapAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New listing created...");
  res.redirect("/listings");
}
));  

//Edit Route
app.get("/listings/:id/edit", isLoggedIn,async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", " listing Edit ");
  res.render("listings/edit.ejs", { listing });
});

 //Update Route
app.put("/listings/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing });
  req.flash("success", " listing Updated ");
  res.redirect(`/listings/${id}`);
});  

//Delete Route
app.delete("/listings/:id", isLoggedIn,
async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("error", " listing Delete! ");
  res.redirect("/listings");
});


// -----------this is review post route -----------
app.post("/listings/:id/reviews", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id.trim());
    const newReview = new Review(req.body.review);
    console.log("New Review Data:", newReview); 
    listing.reviews.push(newReview);
    await Promise.all([newReview.save(), listing.save()]);
    req.flash("success", " Added new reviews ");
    res.redirect(`/listings/${listing.id}`);
  });
app.get('/listings/:id/show', async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id).populate('reviews').exec();
  
      if (!listing) {
        return res.status(404).send('Listing not found');
      }
  
      res.render('show', { listing });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

//----------------------- this is review delete routes-------------------- 
app.delete("/listings/:id/reviews/:reviewId",  isLoggedIn,
wrapAsync(async (req, res) => {
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
  await Review.findById(reviewId);
  req.flash("success", " Review deleted ");
  res.redirect(`/listings/${id}`);
})
)

// ---------error handling /  wrapAsync-------
app.use((err, req , res, next) => {
  res.send("Something went wrong, recheck your form !");
});


// ("/") its mean the web server is working.
  app.listen(8080, () => {
    console.log("server is working......... ");
  });      
















