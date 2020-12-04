const jwt = require("jsonwebtoken");
const config = require("../config");
module.exports = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "Auth failed" });
    }
    const decodedToken = jwt.verify(token, config.JWT_KEY);
    req.userData = {
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Auth failed" });
  }
};
