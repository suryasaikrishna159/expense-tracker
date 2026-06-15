const mongoose=require("mongoose");
const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    month: Number,
    year: Number,
    Food:Number,
    Transport:Number,
    Shopping:Number,
    Bills:Number,
    Entertainment:Number,
    Health:Number,
    Education:Number,
    Other:Number
});
module.exports=new mongoose.model("budget",budgetSchema);