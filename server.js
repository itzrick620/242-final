const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Joi = require("joi");
const multer = require("multer");
const path = require('path');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Adjust the path according to the section of your site
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB connection (replace with your actual connection string)
mongoose.connect('mongodb+srv://itzrick620:Sths2022@cluster0.ckyowgv.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Dog Schema and Model
const dogSchema = new mongoose.Schema({
  dogName: String,
  ownerName: String,
  description: String,
  image: String // This will store the path to the image
});

const Dog = mongoose.model('Dog', dogSchema);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Create a new dog
app.post('/api/dog', upload.single('img'), async (req, res) => {
  const dog = new Dog({
    dogName: req.body.name,
    ownerName: req.body.ownerName,
    description: req.body.description,
    image: req.file ? req.file.path : null // Storing the path to the image if uploaded
  });

  try {
    const savedDog = await dog.save();
    res.send(savedDog);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get all dogs
app.get('/api/dog', async (req, res) => {
  try {
    const dogs = await Dog.find();
    res.send(dogs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a dog (assuming a put request with an existing dog id)
app.put('/api/dog/:id', upload.single('img'), async (req, res) => {
  const updatedData = {
    dogName: req.body.name,
    ownerName: req.body.ownerName,
    description: req.body.description,
    image: req.file ? req.file.path : req.body.image
  };

  try {
    const dog = await Dog.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!dog) return res.status(404).send('The dog with the given ID was not found.');
    res.send(dog);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a dog
app.delete('/api/dog/:id', async (req, res) => {
  try {
    const dog = await Dog.findByIdAndRemove(req.params.id);
    if (!dog) return res.status(404).send('The dog with the given ID was not found.');
    res.send(dog);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
