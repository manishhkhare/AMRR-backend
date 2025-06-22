const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const DataBase = require('../config/db');
const { Item } = require('../modal/addItems');
const env = require('dotenv').config()
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Route to handle item upload
app.post('/api/items', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { itemName, itemType, itemDescription } = req.body;
    const coverImage = req.files['coverImage']?.[0];
    const additionalImages = req.files['additionalImages'] || [];

    if (!coverImage) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    const newItem = new Item({
      name: itemName,
      type: itemType,
      description: itemDescription,
      coverImage: coverImage.filename,
      Images: additionalImages.map(file => file.filename)
    });

    const savedItem = await newItem.save(); 

    res.status(200).json({
      message: 'Item uploaded successfully!',
      data: savedItem
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Failed to upload item', error: err.message });
  }
}); 

// Route to fetch items
app.get('/api/getItems', async (req, res) => {
  try {
    const items = await Item.find();
    if (items && items.length > 0) {
      res.status(200).json({
        success: true,
        data: items,
        count: items.length
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No items found.'
      });
    }
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

app.post('/api/enquire', async (req, res) => {
  const { itemName } = req.body;
  
  console.log(process.env.USER)
  const transporter = nodemailer.createTransport({
    // host: "sandbox.smtp.mailtrap.io", 
    // port: 2525,
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    
    }
  });

  const mailOptions = {
    from: 'Kharem398@gmail.com',
    to: 'Manishkhare733@gmail.com ',
    subject: `Enquiry for ${itemName}`,
    text: `Someone has enquired about the item: ${itemName}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Enquiry email sent successfully!' });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ message: 'Failed to send enquiry email', error: error.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
