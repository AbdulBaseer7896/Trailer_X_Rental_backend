require("dotenv").config();
require("./conn");

const express = require("express");
const User = require("./routes/user");
const MCnumber = require("./routes/mcNumber");
const test = require("./routes/test");

const app = express();


const cors = require('cors');
// app.use(cors());
app.use(cors());
app.use('/uploads', express.static('uploads'));


app.use(express.json());
app.use("/api/v1", User);
app.use("/api/v1", MCnumber);
app.use("/api/v1", test);

app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
