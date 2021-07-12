const express = require("express")
const fileupload = require("express-fileupload")
const sharp = require("sharp")
const mongoose = require("mongoose")
var cors = require('cors')


const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express()

app.use(fileupload())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(express.static("Public"))

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true})


const blogSchema = mongoose.Schema({
    heading:{
        type:String,
        required : [true,"please fill Heading"]
    },
    Post : {
        type:String,
        required : [true,"please fill Some Text"]
    },
    ImgURL: String
})

const Blog = mongoose.model("blog" , blogSchema)


const adminSchema = mongoose.Schema({
    Name:{
        type:String,
        required : [true,"please fill name"]
    },
    Email : {
        type:String,
        required : [true,"please fill email"]
    },
    Password: {
        type:String,
        required : [true,"please fill password"]
    },
    
   
})

const Admin = mongoose.model("admin" , adminSchema)

const messageSchema = mongoose.Schema({
    Name:{
        type:String,
        required : [true,"please fill name"]
    },
    Email : {
        type:String,
        required : [true,"please fill email"]
    },
    Phone: {
        type:Number,
        required : [true,"please fill Phone"]
    },
    Subject: {
        type:String,
        required : [true,"please fill Subject"]
    },
    Message: {
        type:String,
        required : [true,"please fill Message"]
    },
    Date: {
        type: String,
        
    },
    Time: {
        type: String,
        
    },
    isClick: {
        type: Boolean,
        default: false
    },
    
   
})

const Message = mongoose.model("message" , messageSchema)



app.get("/",(req,res)=>{
    Blog.find({},(err,posts)=>{
        if(err){
            console.log(err)
        }else{
            posts.reverse()
            res.json(posts)
        }
    })
})

app.post("/", async (req,res)=>{
    const {heading,Post} = req.body
    let date = new Date()
    let time = date.getTime()
        if(req.files){
            const file =  req.files.file
        await sharp(file.data,{failOnError:false})
        .resize({width: 1200})
        .toFile("./Public/media/images/"+time+".jpg")
        // .toFile("../blog/public/uploads/"+time+".jpg")

        if(!heading || !Post){
            res.json("🙁:Please Enter atleast Heading and Post")
        }else{
            const blog = new Blog({
                heading: heading,
                Post:Post,
                ImgURL : `http://localhost:5000/media/images/${time}.jpg`
                // ImgURL : `./uploads/${time}.jpg`
        })
        blog.save()  
        Blog.find({},(err,postsforall)=>{
            if(err){
                console.log(err)
            }else{
                postsforall.reverse()
                
                res.json(postsforall)
            }
            })
     }
}else{
    if(!heading || !Post){
        res.json("🙁:Please Enter atleast Heading and Post")
    }else{
        const blog = new Blog({
            heading: heading,
            Post:Post,
            ImgURL : ""
            // ImgURL : `./uploads/${time}.jpg`
    }
    )
    blog.save()
    Blog.find({},(err,postsforall)=>{
        if(err){
            console.log(err)
        }else{
            postsforall.reverse()
           
            res.json(postsforall)
        }
        })
 }
}
        
}
)

app.post("/delete",(req,res)=>{
    let {id} = req.body
    console.log(id)
   Blog.deleteOne({_id : id},(err)=>{
       if(err){
           console.log(err)
       }else{
           console.log("successfully deleted")
        }
   })
   Blog.find({},(err,posts)=>{
    if(err){
        console.log(err)
    }else{

        posts.reverse()
        
        res.json(posts)
    }
})

})

app.get("/post/:id",(req,res)=>{
    let {id} =req.params
    Blog.find({_id:id},(err,post)=>{
        if (err){
            console.log(err)
        }else{
            console.log(post)
            res.json(post)
        }
    })
})


app.post("/admin/signup",(req,res)=>{
    let {email,name,password} =req.body

    if (!email || !name || !password){
       
        res.json("Please Fill All Information")
    }else{
        bcrypt.hash(password, saltRounds).then(function(hash) {
            // Store hash in your password DB.
            
            let admin = new Admin({
                Email : email,
                Name : name,
                Password :hash
            })
            admin.save((err)=>{
                if (err){
                    console.log(err)
                }else{
                   
                    res.json("Thank Your For SignUp")
                }
            })
        });
    }

    
    
})
app.post("/admin/signin",(req,res)=>{
    let {email,password} =req.body
    Admin.find({Email:email},(err,data)=>{
        if (err){
            console.log(err)
        }else{
            // Load hash from your password DB.
            
            if (data.length){
                bcrypt.compare(password, data[0].Password).then(function(result) {
                    if (result){
                        
                        res.json(data[0])
                    } else{
                        res.json("Email and Password is Not match")
                    }
                });
            }else{
                
                res.json("Email and Password is Not match")
            }
            
           
        }
    })
})

app.post("/admin/message",(req,res)=>{
    let {Name, Email , Phone , Subject , message} = req.body
    let date = new Date()
    
    
    let todaydate = date.toLocaleString()
    let dateandtime = todaydate.split(",")
    let time = dateandtime



    if(!Name, !Email , !Phone , !Subject , !message){
        res.json("Please Enter All The Information")
    }else{
        message = new Message({
            Name : Name ,
            Email : Email ,
            Phone : Phone , 
            Subject : Subject ,
            Message : message ,
            Date : time[0] ,
            Time : time[1] ,
        })
        message.save(err=>{
            if(err){
                console.log(err)
            }else{
                res.json("thanx for the text")
                
            }
        })
    
    
}})


app.get("/messages",(req,res)=>{
    Message.find({},(err,mess)=>{
        if(err){
            console.log(err)
        }else{
            mess.reverse()
            res.json(mess)
        }
    })
})

app.put("/messagesclick",(req,res)=>{
    let {id} = req.body
    
    Message.updateOne({_id:id},{$set:{
        isClick:true
    }},(err)=>{
        if(err){
            console.log(err)
        }else{
            res.json("is click works")
        }
    })
})

app.get("/showmessage/:id",(req,res)=>{
    let {id} = req.params
    
    Message.find({_id:id},(err,data)=>{
        if(err){
            console.log(err)
        }else{
            res.json(data)
        }
    })
})

app.listen(5000, ()=>{
    console.log("Port Is running on 5000")
})









// console.log(Date.now() )



// app.put("/upload" , async (req , res)=>{
//     // let sizeofImage = await sharp(file.data)
//     // console.log(sizeofImage , "aaaaahahahahahahahahaah")
//     await sharp(file.data).resize({width:800})
//     .toFile(`../blog/public/uploads/${file.name}`)




//     // 
// })











// await file.mv("../blog/public/uploads/"+time+".jpg", (err)=>{
//     if(err){
//         console.log("rahne de nahi ho raha")

//     }else {
//         console.log("ho gaya save")
//     }
// })
