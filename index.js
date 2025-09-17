const express =require('express');
//const uuid=require('uuid');
const mysql=require('./database');
const app=express();
app.use(express.json());

const {getdata,insertdata,update,deletedata}=require('./server');


app.get("/gets",getdata);
app.post("/posts",insertdata);
app.put("/update/:id",update);
app.delete("/delete/:id",deletedata);

const port=3000;
app.listen(port,()=>{
    console.log(`app is running on port ${port}`);
})