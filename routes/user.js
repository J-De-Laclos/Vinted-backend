const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/SHA256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/Users");

/////////ROUTE DU SIGNUP///////////////////
router.post("/user/signup", async (req, res) => {
  try {
    //post donc parametres body
    // console.log("req.body=>", req.body);
    //destructuring
    const { username, email, password, newsletter } = req.body;
    //checker le username
    if (!username || !email || !password) {
      return res.status(400).json({ message: " Missing parameters" });
    }

    //checker si l'email existe deja
    const emailAlreadyExisting = await User.findOne({ email }); //(email=> req.body.email)
    if (emailAlreadyExisting) {
      return res.status(409).json({ message: "Email already exist" });
    }
    //generer le mot de passe pour le BDD
    const salt = uid2(16);
    //generer un token aleatoire
    const token = uid2(16);
    const saltedPassword = password + salt;
    const hash = SHA256(saltedPassword).toString(encBase64);
    //console.log("hash=>", hash);

    //creation d'un nouveau user avec securité
    const newUser = new User({
      account: {
        username,
      },
      email,
      password,
      newsletter: newsletter,
      token, // Ajoutez le token généré au nouvel utilisateur
      hash, // Ajoutez le hachage au nouvel utilisateur
      salt, // Ajoutez le sel au nouvel utilisateur
    });
    console.log("newUser=>", newUser);
    await newUser.save();
    return res.status(200).json({
      message: "User registered successfully",
      _id: newUser._id,
      token: newUser.token,
      account: { username },
    });
  } catch (error) {
    return res.status(400).json({ message: message.error });
  }
});

/////////////ROUTE DU LOGIN////////////////////

router.post("/user/login", async (req, res) => {
  try {
    console.log(req.body);
    // récupérer l'email pour retrouver l'utilisateur en base de données (s'il existe);
    const foundUser = await User.findOne({ email: req.body.email });
    console.log(foundUser);
    if (foundUser) {
      // vérifier le password
      const newHash = SHA256(req.body.password + foundUser.salt).toString(
        encBase64
      );
      if (newHash === foundUser.hash) {
        const responseObject = {
          _id: foundUser._id,
          token: foundUser.token,
          account: {
            username: foundUser.account.username,
          },
        };
        return res.status(200).json(responseObject);
      } else {
        return res.status(400).json({ message: "password or email incorrect" });
      }
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
