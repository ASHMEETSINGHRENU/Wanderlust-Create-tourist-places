// const express = require('express');
// const router = express.Router();
// const wrapAsync = require("../utitiy/wrapAsync.js");
// const { listingSchema, reviewSchema } = require("../schema.js");
// const Listing = require("../models/listing");


// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//       let errMsg = error.details.map((el) => el.message).join(",");
//       throw new ExpressError(400, errMsg);
  
//     }else {
//       next();
//     }
//   };
  






// //Index Route
// // router.get("/listings", async (req, res) => {});
// router.get("/", async (req, res) => {
//     let allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
//   });
  
// //New Route
// router.get("/new", (req, res) => {
//   res.render("listings/new.ejs");
// });


// // show route
// router.get("/:id", wrapAsync (async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id).populate('reviews');
//     if (!listing) {
//       return res.status(404).send("Listing not found");
//     }
//     res.render("/show.ejs", { listing });
// }));

// //Create Route
// router.post("/", 
// wrapAsync(async (req, res, next) => {
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//        res.redirect("/listings");
        

// }
// ));  

// //Edit Route
// router.get("/:id/edit",async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// });

//  //Update Route
// router.put("/:id", async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, {...req.body.listing });
//   res.redirect(`/listings/${id}`);
// });  

// //Delete Route
// router.delete("/:id",
// async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// });

// module.exports = router;