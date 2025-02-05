const mongoose = require("mongoose")
require("dotenv").config();


const conn = async()=>{
    try{
        await mongoose.connect(`${process.env.URI}`)
        console.log("Connected with DB")
    }catch(error){
        console.log(error)
    }
}

conn()