const crypto = require("crypto");
const User = require("../models/users");
const Listing = require("../models/listings");
const { findOne } = require("../models/users");

const productListingHandler = {
  addProductLisiting: async (req, res) => {
    try {
      let user = await User.findById(req.userData.userId);
      let images = [];
      let files = req.files;
      images.push("bucket/" + files.img1[0].filename);
      images.push("bucket/" + files.img2[0].filename);
      files.img3 ? images.push("bucket/" + files.img3[0].filename) : null;
      files.img4 ? images.push("bucket/" + files.img4[0].filename) : null;
      files.img5 ? images.push("bucket/" + files.img5[0].filename) : null;
      files.img6 ? images.push("bucket/" + files.img6[0].filename) : null;
      let productId = await generateProductId();
      let newListing = new Listing({
        productId: productId,
        sellerId: user._id,
        createdAt: new Date(),
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        askingPrice: req.body.askingPrice,
        images: images,
        status: "Not Sold",
      });
      let adCredits = user.adCredits - 10;
      user.adCredits = adCredits;
      await Promise.all([newListing.save(), user.save()]);
      return res.status(200).json({
        message: "Listing added successfully.",
        productId: newListing.productId,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  viewAllListings: async (req, res) => {
    try {
      let listings = await Listing.find({ status: "Not Sold" }).populate(
        "sellerId",
        "name city state"
      );
      return res.status(200).json(listings);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  viewAllListingsByUser: async (req, res) => {
    try {
      let listings = await Listing.find({ sellerId: req.userData.userId });
      return res.status(200).json(listings);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  viewSpecificListing: async (req, res) => {
    try {
      let listing = await Listing.findOne({
        productId: req.params.productId,
      }).populate("sellerId", "name city state");
      if (listing.status === "Sold")
        return res.status(404).json({ message: "Not found." });
      return res.status(200).json(listing);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  viewListingsByCategory: async (req, res) => {
    try {
      let listings = await Listing.find({
        status: "Not Sold",
        category: req.params.category,
      }).populate("sellerId", "name city state");
      return res.status(200).json(listings);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  setProductAsFeatured: async (req, res) => {
    try {
      let user = await User.findById(req.userData.userId);
      if (user.adCredits < req.body.noOfDaysToFeature) {
        return res
          .status(201)
          .json({ message: "You don't have sufficient ad credits." });
      }
      let product = await Listing.findOne({ productId: req.body.productId });
      if (!product) {
        return res
          .status(404)
          .json({ message: "Requested listing not found." });
      }
      if (product.sellerId !== user._id) {
        return res.status(220).json({
          message: "You are not authorised to make changes to this listing.",
        });
      }
      let dateTillFeatured;
      let noOfDaysToFeature = req.body.noOfDaysToFeature;
      if (product.dateTillFeatured) {
        dateTillFeatured = AddDaysToDate(
          new Date(product.dateTillFeatured),
          noOfDaysToFeature
        );
      } else dateTillFeatured = AddDaysToDate(new Date(), noOfDaysToFeature);

      let adCreditsRemaining = user.adCredits - noOfDaysToFeature;
      user.adCredits = adCreditsRemaining;
      product.featuredTillDate = dateTillFeatured;
      await Promise.all([user.save(), product.save()]);
      return res.status(200).json({
        message: "Listing has been set as Featured.",
        dateTillFeatured: dateTillFeatured,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  setListingAsSold: async (req, res) => {
    try {
      let product = await Listing.findOne({ productId: req.body.productId });
      if (!product) {
        return res.status(404).json({ message: "Listing not found." });
      }
      if (product.sellerId !== req.userData.userId) {
        return res.status(220).json({
          message: "You are not authorised to set this listing as sold.",
        });
      }
      product.status = "Sold";
      await product.save();
      return res
        .status(200)
        .json({ message: "Listing successfully set as sold." });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  deleteListing: async (req, res) => {
    try {
      let listing = await Listing.findOne({ productId: req.body.productId });
      if (!listing) return res.status(404).json({ message: "not found" });
      if (listing.sellerId == req.userData.userId) {
        await Listing.findOneAndDelete({ productId: req.body.productId });
        return res.status(200).json({ message: "Deleted successfully." });
      } else return res.status(220).json({ message: "not authorised" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
};
const AddDaysToDate = (ogDate, daysToAdd) => {
  let og_date = new Date(ogDate);
  og_date.setDate(og_date.getDate() + daysToAdd);
  return og_date;
};

const generateProductId = async () => {
  return new Promise(async (resolve, reject) => {
    let id = "listing-" + crypto.randomBytes(5).toString("hex");
    let exisitingProduct = await Listing.findOne({ productId: id })
      .select("productId")
      .lean();
    if (exisitingProduct) {
      generateProductId();
      return;
    }
    console.log(id);
    resolve(id);
  });
};
module.exports = productListingHandler;
