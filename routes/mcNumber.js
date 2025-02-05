const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
const path = require('path');

// Endpoint to handle requests
router.get('/MCnumber/:mc', async (req, res) => {
    const mcNumber = req.params.mc;

    // Validate if the mcNumber is a valid number
    const mcNumberPattern = /^\d+$/; // Regex pattern to check if it's a positive integer

    if (!mcNumberPattern.test(mcNumber)) {

        return res.status(400).send({ error: "Invalid input. Please enter a valid number." });
    }

    // Define the path to your Python script
    const pythonScript = path.join(__dirname, 'pythonCode.py');

    // Command to run the Python script with the MC number as an argument
    const command = `python "${pythonScript}" ${mcNumber}`;

    // Execute the Python script
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return res.status(500).send({ error: "Server Error" });
        }

        if (stderr) {
            console.error(`Python error: ${stderr}`);
        }

        // Send back the Python script's output (assumed to be JSON)
        try {
            const jsonResponse = JSON.parse(stdout);
            console.log("this is important to see" , jsonResponse)
            res.json(jsonResponse);
        } catch (parseError) {
            console.error(`Error parsing JSON: ${parseError}, Output: ${stdout}`);
            res.status(500).send({ error: "Failed to parse response" });
        }
    });
});

module.exports = router;
