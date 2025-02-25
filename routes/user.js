
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const { authenticateToken } = require("./userAuth")
const Carrier = require('../models/CarrierData');  // Import the Carrier model
// POST route to save the carrier data
const express = require('express');
const multer = require('multer');

const fs = require('fs');
const path = require('path');

// // Sign Up
// router.post("/sign-up", async (req, res) => {
//     try {
//         console.log("its work")
//         const { username, email, password, address } = req.body;
//         console.log(username, email, password , address)

//         // Check username length is more than 4
//         if (username.length <= 4) {
//             return res.status(400).json({ message: "Username is too short" });
//         }

//         // Check if username already exists
//         const existingUsername = await User.findOne({ username });
//         if (existingUsername) {
//             return res.status(400).json({ message: "Username already exists" });
//         }

//         // Check if email already exists
//         const existingEmail = await User.findOne({ email });
//         if (existingEmail) {
//             return res.status(400).json({ message: "Email already exists" });
//         }

//         // Check password length
//         if (password.length <= 5) {
//             return res.status(400).json({ message: "Password is too short" });
//         }

//         // Hash the password
//         const hashPass = await bcrypt.hash(password, 10);

//         // Create a new user
//         const newUser = new User({ username, email, password: hashPass, address });

//         await newUser.save();
//         return res.status(200).json({ message: "SignUp Successful" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal Server Error" , error });
//     }
// });


// Sign In
router.post("/sign-in", async (req, res) => {
    try {
        console.log("its working fine")
        const { username, password } = req.body;

        console.log("this si the data = ", username, password)

        // Check if the user exists
        const existingUser = await User.findOne({ email: username });
        console.log("its work = ", existingUser)
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials, user does not exist" });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (isMatch) {
            const authClaims = [
                { name: existingUser.username },
                { role: existingUser.role },
            ]
            const token = jwt.sign({ authClaims }, "bookStore", { expiresIn: "30d" })
            return res.status(200).json({
                message: "SignIn Successful",
                id: existingUser._id,
                role: existingUser.role,
                token: token
            });
        } else {
            return res.status(400).json({ message: "Invalid credentials, password does not match" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



// ger_user-information
router.get("/get-table-data", authenticateToken, async (req, res) => {
    try {
        const data = await User.findById(id).select('-password');
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
});


// router.post("/sign-in" ,  async (req , res)=>{
//         const existingUser = await User.find();
//         console.log("this is the thing we need " , existingUser)
// });






// ger_user-information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await User.findById(id).select('-password');
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
});




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Define where to save the file
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`); // Use the name provided by the frontend
    }
});

const upload = multer({ storage: storage });




// POST route to save the carrier data
router.post('/CarrierData', upload.fields([
    { name: 'COLFile' },
    { name: 'W9File' },
]), async (req, res) => {
    try {
        const carrierData = JSON.parse(req.body.carrierData); // Parse the JSON string from FormData
        const { MCAuthFile, COLFile, W9File, NOVFile } = req.files;

        // Create a new carrier instance with file paths
        const carrier = new Carrier({
            ...carrierData,
            COLFile: COLFile[0].path,
            W9File: W9File[0].path,
        });

        // Save the carrier data to the database
        await carrier.save();
        res.status(201).json({ message: 'Carrier data saved successfully!' });
    } catch (error) {
        console.error('Error saving carrier data:', error);
        res.status(500).json({ message: 'Error saving carrier data', error });
    }
});



// Updated DELETE route
router.delete('/carriersData/:id', authenticateToken, async (req, res) => {
    try {
        const carrier = await Carrier.findById(req.params.id);
        if (!carrier) {
            return res.status(404).json({ message: 'Carrier not found' });
        }

        // Helper function to delete files
        const deleteFile = (filePath) => {
            if (filePath) {
                const fullPath = path.join(__dirname, '..', filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        };

        // Delete associated files
        deleteFile(carrier.COLFile);
        deleteFile(carrier.W9File);
        deleteFile(carrier.NOVFile);
        deleteFile(carrier.MCAuthFile);

        // Delete database record
        await Carrier.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Carrier deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            message: 'Error deleting carrier',
            error: error.message 
        });
    }
});


// // POST route to save the carrier data
// router.post('/CarrierData', upload.fields([
//     { name: 'MCAuthFile' },
//     { name: 'COLFile' },
//     { name: 'W9File' },
//     { name: 'NOVFile' },
// ]), async (req, res) => {
//     try {
//         const carrierData = JSON.parse(req.body.carrierData); // Parse the JSON string from FormData
//         const { MCAuthFile, COLFile, W9File, NOVFile } = req.files;

//         // Create a new carrier instance
//         const carrier = new Carrier({
//             ...carrierData,
//             MCAuthFile: MCAuthFile[0].path, // Store the file path
//             COLFile: COLFile[0].path,
//             W9File: W9File[0].path,
//             NOVFile: NOVFile[0].path
//         });

//         // Save the carrier data to the database
//         await carrier.save();
//         res.status(201).json({ message: 'Carrier data saved successfully!' });
//     } catch (error) {
//         console.error('Error saving carrier data:', error);
//         res.status(500).json({ message: 'Error saving carrier data', error });
//     }
// });



// Define the route for file upload



router.get('/carriersData', async (req, res) => {
    try {
        const carriers = await Carrier.find().sort({ _id: -1 });  // Fetch all records from the Carrier collection
        res.status(200).json(carriers);  // Send the result as JSON
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
});


router.put('/toggleStatus/:id', authenticateToken, async (req, res) => {
    try {
        const carrier = await Carrier.findById(req.params.id);
        if (!carrier) return res.status(404).json({ message: "Carrier not found" });

        // Toggle status
        carrier.isActive = carrier.isActive === 'active' ? 'inActive' : 'active';
        await carrier.save();

        res.status(200).json({ message: "Status updated successfully", carrier });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error });
    }
});





module.exports = router;
