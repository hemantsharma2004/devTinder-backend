
const mongoose= require("mongoose");

const connectdb= async()=>{
    await mongoose.connect("mongodb+srv://hemantshar955:KQQZjqinlAEItRKI@namesta.qkttp.mongodb.net/devTinder")
    
}

module.exports= connectdb;




