const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();

// / Define storage with default multer behavior
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Define where to save the file
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`); // Use the name provided by the frontend
    }
});

const upload = multer({ storage: storage });

// Define the route for file upload
router.post('/test', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'pic', maxCount: 1 }]), function (req, res) {
    console.log("This is the uploaded avatar file = ", req.files['avatar']);
    console.log("This is the uploaded pic file = ", req.files['pic']);
    console.log("This is the upload body = ", req.body);

    res.status(200).json({
        message: "Files uploaded successfully!",
        files: req.files,
        body: req.body,
    });
});

module.exports = router;