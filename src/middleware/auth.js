
const adminAuth=(req, res, next)=>{
    console.log("admin auth is ready")
     const token="xyz";
     const isvalid= token === "xyz";
     if(!isvalid){ 
         res.status(401).send("error occurs");
     }
     else { 
         next();
     }
 }

 module.exports={adminAuth};