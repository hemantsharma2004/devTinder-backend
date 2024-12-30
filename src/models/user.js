const mongoose= require("mongoose");
const validator=require("validator");

const userschema=new mongoose.Schema({
      firstName:{
         type:String,
         required:true,
         maxLength:50,
      },
      lastName:{
        type:String,
     },

     emailId:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:true,
        validate(value){
          if(!validator.isEmail(value)){
             throw new Error("not valid email");
          }
        }
     },

     Password:{
        type:String,
        required:true,
        validate(value){
         if(!validator.isStrongPassword(value)){
            throw new Error("enter a strong password");
         }
       }
     },
     age:{
       type:Number,
       min:18,
     },
     gender:{
      type: String,
       default: "Not Specified",
         validate(value){
             if(!["male", "female", "other", "not specified"].includes(value)){
                throw new Error("data not found");
             }
         }
     },
      photoUrl:{
         type:String,
         default:"https://th.bing.com/th/id/OIP.mP1RB8xuQaHAvUkonYY6HwHaHK?rs=1&pid=ImgDetMain",
         validate(value){
            if(!validator.isURL(value)){
               throw new Error("not valid photo url");
            }
          }
      },
      about:{
         type:String,
         default:"This is a default about of the user",
         maxLength:100,
      },

      skills:{
         type:[String],
      },
     },
     
        {
           timestamps: true
        }
)

const User = mongoose.model("user", userschema);

module.exports= User;