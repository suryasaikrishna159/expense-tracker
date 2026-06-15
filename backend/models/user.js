const mongoose=require("mongoose");

const userschema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    otp:{type:String,default:""},
    otpexpireat:{type:Number,default:0}
})
module.exports=new mongoose.model("users",userschema);