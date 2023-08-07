const express = require("express"); // importation des dépendances
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2; // On n'oublie pas le `.v2` à la fin
const cors = require("cors");
require("dotenv").config();
const app = express(); // création du serveur
app.use(cors());
app.use(express.json()); // Middleware pour les paramètres body

mongoose.connect(process.env.MONGODB_URI); //connexion à la BDD nommée Vinted
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
//import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome Home Page of Vinted" });
});

app.all("*", (req, res) => {
  return res.status(400).json({ message: "Tu es tombé dans le linge sale!!!" });
});

app.listen(process.env.PORT, () => {
  console.log("Mettez vos plus beaux vêtements, c'est partie !");
});
