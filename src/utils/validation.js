 const validator = require("validator");
 
const validateSignUpData=(req)=>{
 const {firstName, emailId, Password}= req.body;

   if(!firstName){
     throw new Error("name is not valid");
   }
   else if(!validator.isEmail(emailId)){
     throw new Error("email is not valid");
   }
   else if(!validator.isStrongPassword(Password)){
     throw new Error("password is not strong")
   }
};


const validateEditProfileData = (req) => {
  const allowedFields = ["firstName", "lastName", "age", "gender", "about", "photoUrl", "skills"];

  const isEditAllowed = Object.keys(req.body).every((field) => 
    allowedFields.includes(field)
  );

  console.log("Validation result:", isEditAllowed);

  return isEditAllowed;
};

 module.exports={validateSignUpData, validateEditProfileData};