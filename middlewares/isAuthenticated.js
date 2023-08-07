const User = require("../models/Users");

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("on rentre ds le middleware");
    // console.log(req.headers.authorization.replace("Bearer ", ""));

    if (req.headers.authorization) {
      const receivedToken = req.headers.authorization.replace("Bearer ", ""); //MET CE PUTAIN D'ESPACE APRES CET ENCULÉ DE BEARER
      const owner = await User.findOne({ token: receivedToken }).select(
        "account _id"
      );
      //console.log(owner);
      if (owner) {
        req.user = owner;
        return next();
      } else {
        res.status(400).json({ message: "Unauthorized2" });
      }
    } else {
      return res.status(400).json({ error: "Unauthorized" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
