const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db('mentora-server')
        const collectionMentora = db.collection('mentora')


        // all courses get system;
        app.get('/mentora', async (req, res) => {
            const result = await collectionMentora.find().toArray();
            res.send(result);
        })

        // courses add system;
        app.post('/mentora', async (req, res) => {
            const course = req.body;
            const result = await collectionMentora.insertOne(course);
            console.log(result);
            res.send(result);
        })

        //only one course find system;
        app.get('/mentora/:id', async (req, res) => {
            const { id } = req.params;
            const result = await collectionMentora.findOne({_id: new ObjectId(id) });
            console.log(result);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is Running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
