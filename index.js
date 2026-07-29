const express = require('express');
const app = express();
const dotenv = require("dotenv")
dotenv.config()
const cors = require('cors')
const port = process.env.PORT;
// jjRtZW4BPiFPCTdD
// ideavault

app.use(cors('cors'))
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const db = await client.db('ideavault')
    const ideasCollection = await db.collection('ideas')
    const commentCollection = await db.collection('comment')

    app.post('/idea', async (req, res) => {
      const ideaData = req.body
      // console.log(ideaData);
      const result = await ideasCollection.insertOne(ideaData)
      res.send(result)
    })
    app.get('/idea', async (req, res) => {
      const result = await ideasCollection.find().toArray()
      res.send(result)
    })

    app.get('/idea/:id', async (req, res) => {
      const { id } = req.params
      console.log(id);
      const result = await ideasCollection.findOne({ _id: new ObjectId(id) })
      res.json(result)
    })
    app.get('/idea/user/:userId', async (req, res) => {
      const { userId } = req.params;
      const result = await ideasCollection.find({ userId }).toArray();
      res.send(result);
    });
    app.patch('/idea/:id',async(req,res)=>{
      const {id} = req.params
      // console.log(id);
      const updateData= req.body
      const result = await ideasCollection.updateOne({_id: new ObjectId(id)},{$set:updateData})
      res.json(result)
    })
    app.delete('/idea/:id',async(req,res)=>{
      const {id} = req.params
      // console.log(id);
      const result = await ideasCollection.deleteOne({_id:new ObjectId(id)})
      res.json(result)
    })
    app.post('/comment',async(req,res)=>{
      const data = req.body
      console.log(data);
      const result = await commentCollection.insertOne(data)
      res.send(result)

    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});