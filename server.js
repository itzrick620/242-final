const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const cors = require("cors");
const multer = require("multer");
const path = require("path");

//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
//Serves static files
app.use(express.static("public"));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/images')); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
mongoose
    .connect("mongodb+srv://itzrick620:Sths2022@cluster0.ckyowgv.mongodb.net/?retryWrites=true&w=majority")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Couldn't connect to MongoDB", error));

// Define schema and model
const dogSchema = new mongoose.Schema({
    dogName: String,
    ownerName: String,
    description: String,
    image: String,
});

const Dog = mongoose.model("Dog", dogSchema);

// Dog Endpoints
app.get("/api/dog", async (req, res) => {
    try {
        const dogs = await Dog.find();
        res.send(dogs);
    } catch (error) {
        res.status(500).send("Error retrieving dogs: " + error.message);
    }
});

app.post("/api/dog", upload.single('img'), async (req, res) => {
  try {
    let imagepath;
    if (req.file) {
      imagepath = '/images/' + req.file.filename; // Path where the image is stored
    }
    
    const newDog = new Dog({
      dogName: req.body.dogName,
      ownerName: req.body.ownerName,
      description: req.body.description,
      image: imagepath,
    });

    const savedDog = await newDog.save();
    res.status(201).send(savedDog);
  } catch (error) {
    res.status(500).send("Error creating dog: " + error.message);
  }
});

app.put("/api/dog/:id", upload.single('img'), async (req, res) => {
    try {
        const updatedDog = await Dog.findByIdAndUpdate(
            req.params.id,
            {
                dogName: req.body.dogName,
                ownerName: req.body.ownerName,
                description: req.body.description,
                image: req.body.image // Handle image update logic here
            },
            { new: true }
        );
        if (!updatedDog) {
            return res.status(404).send("Dog not found.");
        }
        res.send(updatedDog);
    } catch (error) {
        res.status(500).send("Error updating dog: " + error.message);
    }
});

app.delete("/api/dog/:id", async (req, res) => {
    try {
        const deletedDog = await Dog.findByIdAndDelete(req.params.id);
        if (!deletedDog) {
            return res.status(404).send("Dog not found.");
        }
        res.send(deletedDog);
    } catch (error) {
        res.status(500).send("Error deleting dog: " + error.message);
    }
});

// Default page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home/index.html");
});

// Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
