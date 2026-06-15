const jwt=require("jsonwebtoken");

const userauth=(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return res.json({
            success:false,
            msg:"login to continue."
        })
    }

    try{
        const tokendecode=jwt.verify(token,process.env.jwtsecret);
        
        req.userId=tokendecode.id;
        
        next();
    }
    catch(err){
        res.json({
            success:false,
            msg:err.message
        })
    }
}
module.exports=userauth;