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

const storage = multer.diskStorage({
  destination:(req, file, cb) => {
    cb(null, "public");
  },
  filename:(req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});

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
    desc:String,
});

const Dog = mongoose.model("Dog", dogSchema);

//Route
app.get("/api/dogs", (req, res) => {
  getDogs(res);
});

const getDogs = async (res) => {
  const dogs = await Dog.find();
  res.send(dogs);
}

app.get("/api/dogs:id", (req, res) => {
  res.send(dogs);
});


app.post("/api/dogs", upload.single("img"), (req, res) => {
  const result = validateDog(req.body);

  if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
  }

  const dog = new Dog({
      owner: req.body.owner,
      emailOwner: req.body.emailOwner,
      dogName: req.body.dogName,
      desc: req.body.desc,
  });

  if (req.file) {
      dog.img = "../images/" + req.file.filename;
  }

  createDog(dog, res);
});

const createDog = async (dog, res) => {
  const result = await dog.save();
  res.send(dog);
};

app.put("/api/dogs/:id", upload.single("img"), (req, res) => {
  const result = validateDog(req.body);

  if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
  }

  updateDog(req, res);
});

const updateDog = async (req, res) => {
  let fieldsToUpdate = {
    owner: req.body.owner,
    emailOwner: req.body.emailOwner,
    dogName: req.body.dogName,
    desc: req.body.desc,
  };

  if(req.file) {
      fieldsToUpdate.img = "public/" + req.file.filename;
  }

  const result = await Dog.updateOne({_id: req.params.id}, fieldsToUpdate);
  const dog = await Dog.findById(req.params.id);
  res.send(dog);
};

app.delete("/api/dogs/:id", upload.single("img"), (req, res) => {
  removeDog(res, req.params.id);
});

const removeDog = async (res, id) => {
  const dog = await Dog.findByIdAndDelete(id);
  res.send(dog);
};

const validateDog = (dog) => {
  const schema = Joi.object({
      _id: Joi.allow(""),
      desc: Joi.allow(""),
      dogName: Joi.string().min(3).required(),
      owner: Joi.string().min(3).required(),
      emailOwner: Joi.string().min(3).required(),
  });

  return schema.validate(dog);
};

app.get("/", (req, res) => {
  res.send("Dog API Working")
})

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});