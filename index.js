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
const { createRemoteJWKSet } = require("jose-cjs");
const port = process.env.PORT
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(
    new URL('http://localhost:3000/api/auth/jwks')
)

const verifyToken = async (req, res, next) => {
    const token = req?.headers?.authorization;
    console.log('token with headers', token);

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const tokenParts = token?.split(' ')[1];
    console.log('token parts', tokenParts);

    if (!tokenParts) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    try {
        const { payload } = await jwtVerify(tokenParts, JWKS)
        console.log('payload', payload);
        next();
    }
    catch (error) {
        console.log('token is not verify', error);
        return res.status(401).send({ message: 'Unauthorized' });
    }


}

async function run() {
    try {
        await client.connect();

        const db = client.db('mentora-server')
        const collectionMentora = db.collection('mentora')


        // all courses get system;
        app.get('/mentora', verifyToken, async (req, res) => {
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
            const result = await collectionMentora.findOne({ _id: new ObjectId(id) });
            console.log(result);
            res.send(result);
        })

        //all courses update system;
        app.patch('/mentora/:id', async (req, res) => {
            const { id } = req.params;
            const updateUourse = req.body;
            const result = await collectionMentora.updateOne({ _id: new ObjectId(id) }, { $set: updateUourse });
            console.log(result);
            res.send(result);
        })

        //course delete system;
        app.delete('/mentora/:id', async (req, res) => {
            const { id } = req.params;
            const result = await collectionMentora.deleteOne({ _id: new ObjectId(id) });
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
