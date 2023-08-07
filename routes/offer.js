const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary");
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileUpload = require("express-fileupload");
router.use(express.json());

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//Verifier token et autorisation

////////
//creer route en post

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    //console.log(req.headers.authorization);
    // console.log(req.body);
    //console.log(req.files);
    const { title, description, price, condition, city, brand, size, color } =
      req.body;
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ETAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      owner: req.user,
    });

    //console.log(newOffer);

    // const result = await cloudinary.uploader.upload(  //en commentaire pour ne pas spamer cloudinary
    //   convertToBase64(req.files.picture)
    // );
    // newOffer.product_image = result;
    await newOffer.save();
    return res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }

    if (req.query.priceMax) {
      // filters.product_price = {
      //   $lte: Number(req.query.priceMax),
      // };
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }

    const sort = {}; //on rajoute donc un .sort au result
    if (req.query.sort === "price-desc") {
      sort.product_price = -1; // "desc"
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1; //asc
    }

    let limit = 5; // si on veut 5 resultats par page

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    //si jai 10 res par page = 1) skip 0, 2) skip 10, 3) skip20
    //si  j'ai 3 res par page = 1) skip 0, 2) skip 3, 3) skip 6
    const skip = (page - 1) * limit;

    const result = await Offer.find(filters).sort(sort).skip(skip).limit(limit);

    const count = await Offer.countDocuments(filters);
    //console.log(req.query);

    return res.status(200).json({ count: count, offers: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
