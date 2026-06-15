require("dotenv").config();
const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const transporter=require("./config/nodemailer");
const cookieparser=require("cookie-parser");
const cors=require("cors");
const mongoose=require("mongoose");
//--------------------------------------------------------------------------------------
const app=express();
//---------------------------------------------middleware--------------------------------
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
//--------------------------------------------connecting to database---------------------
const connectdb=require("./config/db");
connectdb();
//----------------------------------------------models-----------------------------------
const users=require("./models/user");
const expense=require("./models/expense");
const userauth=require("./middleware/auth");
const budget=require("./models/budget");
const chat=require("./models/chat");
//-------------------------------------------connecting to gemeni-----------------------
const ai = require("./config/gemeni");
//--------------------------------------------API to register----------------------------
app.post("/api/v1/register",async (req,res)=>{
    const {name,email,password}=req.body;

    if(!name||!email||!password){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }

    try{
        const emailexists=await users.findOne({email});
        if(emailexists){
            return res.json({
                success:false,
                msg:"email already exists"
            })
        }

        const hashedpassword=await bcrypt.hash(password,10);
        const newuser=await users.create({name,email,password:hashedpassword});

        res.json({
            success:true,
            msg:"user created successfully"
        })
    }
    catch(err){
        return res.json({
            success:false,
            msg:err.message
        })
    }

})

//----------------------------------------------API to login-------------------------------

app.post("/api/v1/login",async (req,res)=>{
    const {email,password}=req.body;

    if(!email||!password){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }

    try{
        const userexists=await users.findOne({email});

        if(!userexists){
            return res.json({
                success:false,
                msg:"email doesent exist(first register)"
            })
        }

        const ismatch=await bcrypt.compare(password,userexists.password);
        if(!ismatch){
            return res.json({
                success:false,
                msg:"wrong password"
            })
        }

        const token=jwt.sign({id:userexists._id},process.env.jwtsecret,{expiresIn:"1d"});
        res.cookie("token",token,{
            httpOnly: true,
            secure: false, 
            sameSite: "lax", 
            maxAge: 1 * 24 * 60 * 60 * 1000
        })


        res.json({
            success:true,
            msg:`HELLO ${userexists.name}`
        })
    }
    catch(err){
        return res.json({
            success:false,
            msg:err.message
        })
    }
})
//---------------------------------------API to get otp--------------------------------
app.post("/api/v1/sendotp",async (req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }

    try{
        const finduser=await users.findOne({email});
        if(!finduser){
            return res.json({
                success:false,
                msg:"invalid email"
            })
        }

        const otp=String(Math.floor(100000+Math.random()*900000));
        finduser.otp=otp;
        finduser.otpexpireat=Date.now()+10*60*1000;
        await finduser.save();

        const mailoptions={
            from:process.env.SENDERS_EMAIL,
            to:finduser.email,
            subject:"password reset otp verification",
            text:`your password reset otp is ${otp}`
        }

        await transporter.sendMail(mailoptions);

        res.json({success:true,msg:"password reset otp sent successfully on your email"});
    }
    catch(err){
        return res.json({
            success:false,
            msg:err.message
        })
    }

})

//---------------------------------------API for forget-password------------------------
app.post("/api/v1/forgetpassword",async(req,res)=>{
    const{email,password,otp}=req.body;
    if(!email||!password||!otp){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }

    try{
        const checkemail=await users.findOne({email});
        if(!checkemail){
            return res.json({
                success:false,
                msg:"invalid email"
            })
        }

        if(checkemail.otp==""||checkemail.otp!=otp){
            return res.json({
                success:false,
                msg:"wrong otp"
            })
        }
        if(checkemail.otpexpireat<Date.now()){
            return res.json({success:false,msg:"OTP Expired"});
        }

        const newhashedpassword=await bcrypt.hash(password,10);
        checkemail.password=newhashedpassword;

        checkemail.otp="";
        checkemail.otpexpireat=0;
        await checkemail.save();

        return res.json({
            success:true,
            msg:"password updated successfully!"
        })

    }
    catch(err){
        return res.json({
            success:false,
            msg:err.message
        })
    }

})
//------------------------------------------API to logout-------------------------------
app.post("/api/v1/logout",userauth,async (req,res)=>{

    try{
        res.clearCookie("token",{
            httpOnly: true,
            secure: false, 
            sameSite: "lax", 
            maxAge: 1 * 24 * 60 * 60 * 1000
        })

        res.json({success:true,msg:"user logged out successfully"});
    }
    catch(err){
        res.json({success:false,msg:err.message});
    }
})
//------------------------------------------TO get user data----------------------------
app.get("/api/v1/profile",userauth,async (req,res)=>{
    const {userid}=req;

    if(!userid){
        return res.json({
                    success:false,
                    msg:"login to continue."
                })
    }
    try{
        const user=await users.findById(userid);
        if(!user){
            return res.json({
                success:false,
                msg:"invalid user"
            })
        }

        res.json({
            success:true,
            msg:"found user data",
            userdata:{
                name:user.name,
                email:user.email
            }
        })
    }
    catch(err){
        res.json({
            success:false,
            msg:err.message
        })
    }
})
//---------------------------------------API for adding expense--------------------------
app.post("/api/v1/expenses",userauth,async(req,res)=>{
    const {title,amount,category,date}=req.body;
    const {userId}=req;
    if(!title||!amount||!category||!date||!userId){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }
    try{
        const newexpense=await expense.create({title,amount,category,date,userId});
        

        res.json({
            success:true,
            msg:"expense added successfully!"
        })
    }
    catch(err){
        res.json({
            success:false,
            msg:err.message
        })
    }
})
//-------------------------------------API for deleting expense-------------------------
app.delete("/api/v1/expenses/:_id",userauth,async(req,res)=>{
    const {_id}=req.params;
    const {userId}=req;
    if(!userId){
        return res.json({
            success:false,
            msg:"Login to continue"
        })
    }

    try{
        const result = await expense.deleteOne({
            _id,
            userId
        });

        if (result.deletedCount === 0) {
            return res.json({
                success: false,
                msg: "Expense not found or unauthorized"
            });
        }
        res.json({
            success:true,
            msg:"Expense Deleted"
        })
    }
    catch(err){
        res.json({
            success:false,
            msg:err.message
        })
    }
})
//-----------------------------------------API to edit expense--------------------------
app.put("/api/v1/expenses/:_id",userauth,async(req,res)=>{
    const {_id}=req.params;
    const {title,amount,category,date}=req.body;
    const {userId}=req;
    if(!userId){
        return res.json({
            success:false,
            msg:"Login to continue"
        })
    }
    if(!title||!amount||!category||!date||!userId){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }
    try{
        const updatedExpense = await expense.findOneAndUpdate(
            {
                _id,
                userId
            },
            {
                title,
                amount,
                category,
                date
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedExpense) {
            return res.json({
                success: false,
                msg: "Expense not found or unauthorized"
            });
        }

        res.json({
            success: true,
            msg: "Expense updated successfully",
            expense: updatedExpense
        });
    }
    catch(err){
        res.json({
            success:false,
            msg:err.message
        })
    }
})
//-------------------------------------api to get user data------------------------------
app.get("/api/v1/expenses", userauth, async (req, res) => {
    const { userId } = req;
    const { category, date } = req.query;

    if (!userId) {
        return res.json({
            success: false,
            msg: "Login to continue"
        });
    }

    try {
        const filter = {
            userId
        };

        const matchStage = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        if (category) {
            filter.category = category;
            matchStage.category = category;
        }

        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);

            filter.date = {
                $gte: start,
                $lt: end
            };

            matchStage.date = {
                $gte: start,
                $lt: end
            };
        }

        const result = await expense.find(filter).sort({ date: -1 });

        const calcsum = await expense.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const total = calcsum.length > 0 ? calcsum[0].total : 0;

        res.json({
            success: true,
            expenses: result,
            sum: total,
            nbHits: result.length,
            msg: "Expenses fetched successfully"
        });

    } catch (err) {
        res.json({
            success: false,
            msg: err.message
        });
    }
});
//-----------------------------------------api for monthly report------------------------
app.get("/api/v1/monthlyreport",userauth,async(req,res)=>{
    const {userId}=req;
    const{month,year}=req.query;
    if(!userId){
        return res.json({
            success:false,
            msg:"login to continue"
        })
    }
    if(!month||!year){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }
    try {

        const matchStage = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        const start = new Date(year,month-1,1);
        const end = new Date(year,month,1);

        matchStage.date = {
            $gte: start,
            $lt: end
        };
        
        const calcsum = await expense.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const grandTotal = calcsum.reduce(
            (sum, item) => sum + item.total,
            0
        );

        const cus_name=await users.findById(userId);

        res.json({
            success: true,
            name:cus_name.name,
            report: calcsum,
            grandTotal,
            nbHits: calcsum.length,
            msg: "report fetched successfully"
        });

    } catch (err) {
        res.json({
            success: false,
            msg: err.message
        });
    }
})
//-----------------------------------------set budgets----------------------------------
app.put("/api/v1/setbudget",userauth,async(req,res)=>{
    const {userId}=req;
    const{month,year,Food,Transport,Shopping,Bills,Entertainment,Health,Education,Other}=req.body;
    if(!userId){
        return res.json({
            success:false,
            msg:"login to continue"
        })
    }
    if(
        month == null ||
        year == null ||
        Food == null ||
        Transport == null ||
        Shopping == null ||
        Bills == null ||
        Entertainment == null ||
        Health == null ||
        Education == null ||
        Other == null
    ){
        return res.json({
            success:false,
            msg:"missing credentials"
        })
    }
    try{
        const created=await budget.findOneAndUpdate(
            {userId,month,year},
            {month,year,Food,Transport,Shopping,Bills,Entertainment,Health,Education,Other},
            {
                new:true,
                upsert:true,
                runValidators:true
            }
        );
        if (!created) {
            return res.json({
                success: false,
                msg: "budget not updated"
            });
        }
        res.json({
            success:true,
            msg:`budget set successfully for ${month}/${year}`
        })
    }
    catch (err) {
        res.json({
            success: false,
            msg: err.message
        });
    }
})
//----------------------------------------get budget insights----------------------------
app.get("/api/v1/insights",userauth,async(req,res)=>{
    const{userId}=req;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const thismonthbudget=await budget.findOne({userId,month,year});
    if(!thismonthbudget){
        return res.json({
            success:false,
            msg:"budget not set for this month"
        })
    }

    try{
        const matchStage = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        const start = new Date(year,month-1,1);
        const end = new Date(year,month,1);

        matchStage.date = {
            $gte: start,
            $lt: end
        };
        
        const calcsum = await expense.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const budgetObj = thismonthbudget.toObject();

        const spentMap = {};

        calcsum.forEach(item => {
            spentMap[item._id] = item.total;
        });

        const categories = [
            "Food",
            "Transport",
            "Shopping",
            "Bills",
            "Entertainment",
            "Health",
            "Education",
            "Other"
        ];

        const insights = categories.map(category => {

            const budgetAmount = budgetObj[category] || 0;
            const spentAmount = spentMap[category] || 0;

            const percentageUsed =
                budgetAmount > 0
                    ? ((spentAmount / budgetAmount) * 100).toFixed(2)
                    : 0;

            const difference = Math.abs(spentAmount - budgetAmount);

            return {
                category,
                budget: budgetAmount,
                spent: spentAmount,
                percentageUsed: Number(percentageUsed),
                status:
                    spentAmount > budgetAmount
                        ? "Exceeded"
                        : "Saved",
                amount: difference
            };
        });

        res.json({
            success: true,
            month,
            year,
            insights
        });
    }
    catch(err){
        res.json({
            success: false,
            msg: err.message
        });
    }
})

//------------------------------------------to get saved chats--------------------------
app.get("/api/v1/getchats",userauth,async(req,res)=>{
    const {userId}=req;
    const result=await chat.find({userId:userId}).sort({date:-1});
    res.json({
        success:true,
        chats:result
    })
})
//-------------------------------------------gemeni api----------------------------------
app.post("/api/v1/ai",userauth,async(req,res)=>{
    const {query}=req.body;
    const {userId}=req;
    if(!query){
        return res.json({
            success:false,
            msg:"provide query"
        })
    }
    try{
        const prompt = `
            You are an expert MongoDB aggregation pipeline generator for an Expense Tracker application.

            Current Date:
            ${new Date().toISOString()}

            Available Collections:

            expense
            {
            title: String,
            amount: Number,
            category: String,
            date: Date,
            userId: ObjectId
            }

            budget
            {
            userId: ObjectId,
            month: Number,
            year: Number,
            Food: Number,
            Transport: Number,
            Shopping: Number,
            Bills: Number,
            Entertainment: Number,
            Health: Number,
            Education: Number,
            Other: Number
            }

            Valid collection names:

            * expense
            * budget

            Valid categories:

            * Food
            * Transport
            * Shopping
            * Bills
            * Entertainment
            * Health
            * Education
            * Other

            Rules:

            1. Return ONLY valid JSON.
            2. Do NOT wrap response in markdown.
            3. Do NOT explain anything.
            4. Response format MUST be:

            {
            "collection":"",
            "pipeline":[]
            }

            5. Collection must be either:

            * expense
            * budget

            6. Generate ONLY MongoDB aggregation pipelines.

            7. Never generate:

            * delete
            * update
            * insert
            * remove
            * drop
            * createCollection

            8. Never include userId in $match.
            The backend will inject userId automatically.

            9. For date-related questions use actual ISO dates based on Current Date.

            10. Always return a valid aggregation pipeline.
            11. When analyzing budget categories, only consider:

                Food
                Transport
                Shopping
                Bills
                Entertainment
                Health
                Education
                Other

                

            Examples:

            Question:
            How much did I spend on Food this month?

            Output:
            {
            "collection":"expense",
            "pipeline":[
            {
            "$match":{
            "category":"Food",
            "date":{
            "$gte":"2026-06-01T00:00:00.000Z",
            "$lte":"2026-06-30T23:59:59.999Z"
            }
            }
            },
            {
            "$group":{
            "_id":null,
            "total":{
            "$sum":"$amount"
            }
            }
            }
            ]
            }

            Question:
            Which category did I spend the most on?

            Output:
            {
            "collection":"expense",
            "pipeline":[
            {
            "$group":{
            "_id":"$category",
            "total":{
            "$sum":"$amount"
            }
            }
            },
            {
            "$sort":{
            "total":-1
            }
            },
            {
            "$limit":1
            }
            ]
            }

            Question:
            ${query}
        `;

        const response =await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        console.log(response.text);

        const collections = {
            expense,
            budget
        };

        const result = JSON.parse(response.text);

        result.pipeline.unshift({
            $match:{
                userId: new mongoose.Types.ObjectId(userId)
            }
        });

        if(!collections[result.collection]){
            return res.json({
                success:false,
                msg:"Invalid collection"
            });
        }
        result.pipeline.forEach(stage => {

            if(stage.$match?.date?.$gte){
                stage.$match.date.$gte =
                    new Date(stage.$match.date.$gte);
            }

            if(stage.$match?.date?.$lte){
                stage.$match.date.$lte =
                    new Date(stage.$match.date.$lte);
            }

        });
        const data =await collections[result.collection].aggregate(result.pipeline);
        if(data.length==0){
            return res.json({
                success:true,
                answer:"No matching records found."
            });
        }
        console.log(data);
        if(data[0]){
            const prompt2 = `
                You are a financial assistant.

                User Question:
                ${query}

                Database Result:
                ${JSON.stringify(data)}

                Rules:
                1. Use only the provided database result.
                2. Do not invent values.
                3. Keep response under 100 words.
                4. Mention currency as ₹.
                5. If the result contains category names, explain them clearly.
                6. Generate a short conversation title suitable for chat history.
                7. Title must be between 3 and 8 words.
                8. Title should summarize the user's question, not the answer.
                9. Do not include punctuation at the beginning or end.
                10. Use title case.
                11. Examples:

                Question: How much did I spend on Food this month?
                Title: Food Spending This Month

                Question: Which category did I spend the most on?
                Title: Highest Spending Category

                Question: least category i spent in june
                Title: Lowest Spending Category In June

                Question: compare my food spending this month and last month
                Title: Food Spending Comparison

                Question: what was my biggest expense this year
                Title: Biggest Expense This Year

                Generate a concise title that could be displayed in a sidebar chat history.
                The title should be based primarily on the user's question.
                Avoid generic titles such as:
                - Expense Analysis
                - Financial Report
                - Spending Summary

                Prefer specific titles such as:
                - Food Spending This Month
                - June Expense Breakdown
                - Lowest Spending Category In June
                - Budget vs Expenses
                - Highest Expense This Year
                Rules:

                1. Return ONLY valid JSON.
                2. Do NOT wrap response in markdown.
                
                3. Response format MUST be:

                {
                "title":"",
                "explain":
                }
                
            `;
            const explain =await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt2
            });
            const result2=JSON.parse(explain.text)
            console.log(explain.text);

            const save=await chat.create({
                userId,
                title:result2.title,
                query,
                answer:result2.explain
            })

            res.json({
                success:true,
                title:result2.title,
                answer:result2.explain
            })

        }
    }
    catch(err){
        return res.json({
            success:false,
            msg:err.message
        })
    }
    
})

//--------------------------------------------listening----------------------------------
app.listen(5000,()=>{
    console.log("backend is running on port 5000");
})


