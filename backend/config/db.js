const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();

const connectdb=async ()=>{
    await mongoose.connect(process.env.mongouri)
    .then(()=>{
        console.log("connected to database successfully!!");
    })
    .catch((err)=>{
        console.log(err);
    })
}
module.exports=connectdb;