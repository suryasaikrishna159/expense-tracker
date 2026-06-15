const mongoose=require("mongoose");

const expenseschema=new mongoose.Schema({
    title:{type:String,required:true},
    amount:{type:Number,required:true},
    category:{type:String,required:true,enum: ["Food","Transport","Shopping","Bills","Entertainment","Health","Education","Other",]},
    date:{type:Date,required:true,default:Date.now},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
})
module.exports=new mongoose.model("expense",expenseschema);