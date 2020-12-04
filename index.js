const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config");
const UserRoutes = require("./routes/userRoutes");
const ListingRoutes = require("./routes/listingRoutes");
const UtilityRoutes = require("./routes/utilityRoutes");
const PaymentRoutes = require("./routes/paymentRoutes");
const passport = require("passport");
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 50000,
  })
);
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/bucket", express.static("uploads"));
app.use("/user", UserRoutes);
app.use("/listing", ListingRoutes);
app.use("/utility", UtilityRoutes);
app.use("/payment", PaymentRoutes);
mongoose
  .connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(
    () => {
      console.log("Connected to database");
    },
    (err) => {
      console.log(err);
      console.log("Connection Failed");
    }
  );

app.set("port", PORT);

app.listen(PORT, () => {
  console.log("server is listening at " + PORT);
});

app.get("/", async (req, res) => {
  return res.json({ message: "working" });
});
