const mongoose = require("mongoose")

const User  = new mongoose.Schema({
    username: { type: String , required: true, unique: true},
    email: {type:String , required: true, unique: true},
    password: {type: String , require: true},
    address: {type: String , required: true},
    avatar: {type: String, default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"},
    role:{type:String , default:"admin" , enum: ["user" , "admin"]},
    favorites: [{type:mongoose.Types.ObjectId , ref: "books"}],
    cart: [{type:mongoose.Types.ObjectId , ref: "books"}],
    orders: [{type:mongoose.Types.ObjectId , ref: "order"}],

}, {timestamps: true}
)



// module.exports = CarrierData;



module.exports = mongoose.model("User" , User ,)
