require('dotenv').config();
const express = require('express');
const cors = require('cors');


const connectDB = require('./middleware/db');

const app = express();
app.use(express.json());
app.use(cors());

app.get("/",async(req,res)=>{
  res.json("This is my Coffee Chat website")
})

const PORT=process.env.PORT
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
