require("dotenv").config();
require("./conn");

const express = require("express");
const User = require("./routes/user");
const MCnumber = require("./routes/mcNumber");
const test = require("./routes/test");
const cors = require('cors');

const app = express();
// app.use(cors());
// app.use(cors());
app.use(cors({
  origin: 'https://freightxrental.com', // Your React app's origin
  // origin: 'http://localhost:3001', // Your React app's origin
  credentials: true
}));
app.use('/uploads', express.static('uploads'));


app.use(express.json());
app.use("/api/v1", User);
app.use("/api/v1", MCnumber);
app.use("/api/v1", test);

app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
