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
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken =async (req, res, next) => {
  const authHeader = req?.headers.authorization
  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }
  const token = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  try {
    const { payload } = await jwtVerify(token, JWKS)
    
    console.log(payload);
    next()
  }catch(error){
    return res.status(401).json({
      message: "Forbidden"
    })
  }
}

async function run() {
  try {

    const db = await client.db('ideavault')
    const ideasCollection = await db.collection('ideas')
    const commentCollection = await db.collection('comment')
    const userCollention = await db.collection('user')

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

    app.get('/featured', async (req, res) => {
      const result = await ideasCollection.find().limit(6).toArray()
      res.send(result)
    })

    app.get('/idea/:id',verifyToken , async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const result = await ideasCollection.findOne({ _id: new ObjectId(id) })
      res.json(result)
    })
    app.get('/idea/user/:userId',verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await ideasCollection.find({ userId }).toArray();
      res.send(result);
    });
    app.patch('/idea/:id', async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const updateData = req.body
      const result = await ideasCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
      res.json(result)
    })
    app.delete('/idea/:id', async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const result = await ideasCollection.deleteOne({ _id: new ObjectId(id) })
      res.json(result)
    })
    app.post('/comment', async (req, res) => {
      const data = req.body
      // console.log(data);
      const result = await commentCollection.insertOne(data)
      res.send(result)

    })
    app.get('/comment', async (req, res) => {
      const result = await commentCollection.find().toArray()
      res.send(result)
    })
    app.get('/comment/:ideaId',async (req, res) => {
      const { ideaId } = req.params
      const result = await commentCollection.find({ ideaId }).toArray()
      res.json(result)
    })
    app.get('/comment/user/:userId',verifyToken ,async (req, res) => {
      const { userId } = req.params
      const result = await commentCollection.find({ userId }).toArray()
      res.json(result)
    })
    app.patch('/comment/:id', async (req, res) => {
      const { id } = req.params
      // console.log(id);
      const updateData = req.body
      const result = await commentCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
      res.json(result)
    })
    app.delete('/comment/:userId', async (req, res) => {
      const { userId } = req.params
      const result = await commentCollection.deleteOne({ userId })
      res.json(result)
    })
    app.get('/user',async(req,res)=>{
        const result = await userCollention.find().toArray()
        res.send(result)
    })
    app.get('/user/:email',async(req,res)=>{
        const {email}=req.params
        const result = await userCollention.find({email}).toArray()
        res.send(result)
    })
    app.patch('/user/:id', async (req, res) => {
    const { id } = req.params
    console.log(id);
    const updateData = req.body
    const result = await userCollention.updateOne(
        { _id: new ObjectId(id) }, 
        { $set: updateData }
    )
    console.log(result);
    res.send(result)
})
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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