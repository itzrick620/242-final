const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose
    .connect("mongodb+srv://itzrick620:Sths2022@cluster0.ckyowgv.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch((error) => console.log("Couldn't connect to mongodb", error));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "../index.html");
});

// Create a mongoose model for pages
const Page = mongoose.model('Page', {
  folderName: String,
  title: String,
  content: String,
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle wildcard route to serve files dynamically from MongoDB
app.get('/:folderName', async (req, res) => {
  const folderName = req.params.folderName;

  try {
    // Fetch data from MongoDB based on the folderName
    const page = await Page.findOne({ folderName });

    if (page) {
      res.sendFile(path.join(__dirname, 'public', folderName, 'index.html'));
    } else {
      res.status(404).send('Page not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
