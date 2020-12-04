const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const userHandler = {
  create_account: async (req, res) => {
    try {
      let existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res
          .status(201)
          .json({ message: "This email is already registered." });
      }
      existingUser = await User.findOne({ phone: req.body.phone });
      if (existingUser) {
        return res
          .status(201)
          .json({ message: "This phone is already registered." });
      }
      let newUser = new User({
        name: req.body.name,
        username: req.body.email,
        email: req.body.email,
        phone: req.body.phone,
        adCredits: 50,
      });

      User.register(newUser, req.body.password, (error, savedUser) => {
        const token = jwt.sign(
          {
            userId: savedUser._id,
          },
          config.JWT_KEY,
          { expiresIn: "24h" }
        );
        res.status(200).json({
          message: "User created.",
          token,
          _id: savedUser._id,
        });
      });
    } catch (e) {
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  login: async (req, res) => {
    try {
      let user;
      if (req.body.phone) user = await User.findOne({ phone: req.body.phone });
      else user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      } else {
        passport.authenticate("local", (err, user, info) => {
          if (user) {
            const token = jwt.sign(
              {
                userId: user._id,
              },
              config.JWT_KEY,
              { expiresIn: "24h" }
            );
            return res.status(200).json({
              ...user._doc,
              token,
            });
          } else {
            return res.status(201).json({
              message: "Wrong Password",
            });
          }
        })(req, res);
      }
    } catch (e) {
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  fetchProfile: async (req, res) => {
    try {
      let user = await User.findById(req.userData.userId);
      if (user) {
        return res.status(200).json(user);
      } else return res.status(404).json({ message: "User not found." });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  updateProfile: async (req, res) => {
    try {
      let user = await User.findById(req.userData.userId);
      if (user) {
        user.state = req.body.state;
        user.city = req.body.city;
        await user.save();
        return res
          .status(200)
          .json({ message: "Profile updated successfully." });
      } else return res.status(404).json({ message: "User not found." });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
};

module.exports = userHandler;
