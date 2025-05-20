require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.i1uhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db('food-item-collection').collection('tem-menu');
    const foodCardCollection = client.db('bistro-card').collection('cards');
    app.get('/menu', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const category = req.query.category;
      const query = category ? { category: category } : {};

      console.log('pagination', req.query, page, size);
      const result = await foodCollection.find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    })

    app.get('/menuCount', async (req, res) => {
      const count = await foodCollection.countDocuments();
      res.send(count);
    })

    app.post('/cards', async (req, res) => {
      const cardItem = req.body;
      const result = await foodCardCollection.insertOne(cardItem);
      res.send(result);
    })

    app.get('/cards', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await foodCardCollection.find(query).toArray();
      res.send(result);
    })

    app.delete('/carts/:id' , async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await foodCardCollection.deleteOne(query)
      res.send(result);
    })

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
  res.send('Welcome to food sharing system')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})