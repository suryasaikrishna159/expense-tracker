const mongoose=require("mongoose");

const chatschema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
    title:{type:String,required:true},
    query:{type:String,required:true},
    answer:{type:String,required:true},
    date:{type:Date,default:Date.now}
})

module.exports=new mongoose.model("chat",chatschema);