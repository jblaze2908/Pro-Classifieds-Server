const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const Upload = require("../middleware/multer");
const productListingHandler = require("../controllers/productListingHandler");
const imageFilesList = [
  { name: "img1" },
  { name: "img2" },
  { name: "img3" },
  { name: "img4" },
  { name: "img5" },
  { name: "img6" },
];
router.post(
  "/add_listing",
  checkAuth,
  Upload.fields(imageFilesList),
  productListingHandler.addProductLisiting
);
router.get(
  "/view_user_listing",
  checkAuth,
  productListingHandler.viewAllListingsByUser
);
router.get(
  "/fetch_listing_detail/:productId",
  productListingHandler.viewSpecificListing
);
router.post("/delete_listing", checkAuth, productListingHandler.deleteListing);
router.get("/fetch_all_listing", productListingHandler.viewAllListings);
router.get(
  "/fetch_listing_by_category/:category",
  productListingHandler.viewListingsByCategory
);
module.exports = router;
