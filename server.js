const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");


const upload = multer({dest: __dirname + "/public/images/"});

// Connect to MongoDB
mongoose
    .connect("mongodb+srv://itzrick620:Sths2022@cluster0.ckyowgv.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch((error) => console.log("Couldn't connect to mongodb", error));

// Create a schema 
const dogSchema = new mongoose.Schema({
    owner:String,
    dogName:String,
    img:String,
    desc:[String],
});

const Dog = mongoose.model("Dog", dogSchema);

//Route
app.get("/api/dog", (req, res) => {
  getDogData(res);
});

const getDogData = async (res) => {
  const dogItems = await Dog.find();
  res.send(dogItems);
};

app.post("/api/dog", upload.single("image"), (req, res) => {
  const result = validateDogItem(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const dogItem = new Dog({
    dogName: req.body.dogName,
    ownerName: req.body.ownerName,
    description: req.body.description.split(","),
  });

  if (req.file) {
    dogItem.image = "images/" + req.file.filename;
  }

  createDogItem(dogItem, res);
});

const createDogItem = async (dogItem, res) => {
  const result = await dogItem.save();
  res.send(dogItem);
};

app.put("/api/dog/:id", upload.single("image"), (req, res) => {
  const result = validateDogItem(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  updateDogItem(req, res);
});

const updateDogItem = async (req, res) => {
  let fieldsToUpdate = {
    dogName: req.body.dogName,
    ownerName: req.body.ownerName,
    description: req.body.description.split(","),
  };

  if (req.file) {
    fieldsToUpdate.image = "images/" + req.file.filename;
  }

  const result = await Dog.updateOne(
    { _id: req.params.id },
    fieldsToUpdate
  );
  const dogItem = await Dog.findById(req.params.id);
  res.send(dogItem);
};

app.delete("/api/dog/:id", upload.single("image"), (req, res) => {
  removeDogItem(res, req.params.id);
});

const removeDogItem = async (res, id) => {
  const dogItem = await Dog.findByIdAndDelete(id);
  res.send(dogItem);
};

const validateDogItem = (dogItem) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    dogName: Joi.string().min(3).required(),
    ownerName: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
  });

  return schema.validate(dogItem);
};

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});