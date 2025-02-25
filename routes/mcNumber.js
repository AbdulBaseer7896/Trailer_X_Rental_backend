const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
const path = require('path');
const { default: axios } = require('axios');
const https = require('https');
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





router.get('/mc-lookup/:mcNumber', async (req, res) => {
    const mcNumber = req.params.mcNumber;

    // Validate MC number format
    const mcNumberPattern = /^\d+$/;
    if (!mcNumberPattern.test(mcNumber)) {
        return res.status(400).send({ error: "Invalid MC number format" });
    }

    try {
        const apiUrl = `https://highway.com/monitor/api/v1/carriers/by_identifier?is_type=MC&value=${mcNumber}`;
        
        // Configure axios instance
        const instance = axios.create({
            httpsAgent: new https.Agent({ keepAlive: true }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/html, application/xhtml+xml, application/xml',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Referer': 'https://highway.com/',
                'Priority': 'u=0, i',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const response = await instance.get(apiUrl, {
            params: req.query,
            headers: {
                'Cookie': req.headers.cookie || '',
                'If-None-Match': req.headers['if-none-match']
            },
            validateStatus: (status) => status < 500
        });

        // Extract and format data
        const carrierData = response.data;
        const formattedData = {
            Legal_Name: carrierData.legal_name || 'N/A',
            Physical_Address: [
                carrierData.physical_address?.street1,
                carrierData.physical_address?.city,
                carrierData.physical_address?.state,
                carrierData.physical_address?.postal_code
            ].filter(Boolean).join(', '),
            MC: carrierData.identifiers?.find(id => id.is_type === "MC")?.value || 'N/A',
            Phone: carrierData.phones?.[0]?.value || 'N/A',
            USDOT_Number: carrierData.identifiers?.find(id => id.is_type === "DOT")?.value || 'N/A',
            Email: carrierData.email_addresses?.[0]?.value || 'N/A'
        };

        // Forward relevant headers
        res.set({
            'Cache-Control': response.headers['cache-control'],
            'ETag': response.headers['etag'],
            'Vary': response.headers['vary']
        });
        console.log("This si the data = "  , formattedData)

        res.status(response.status).json(formattedData);

    } catch (error) {
        console.error('MC Lookup Error:', error);
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message;
        
        res.status(status).json({
            error: 'Failed to fetch carrier data',
            details: errorMessage
        });
    }
});

module.exports = router;
