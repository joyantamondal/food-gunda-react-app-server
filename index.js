const express= require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdgqc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run(){
    try{
        await client.connect();
        const database = client.db('online_Shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        
        // GET Products API 
        app.get('/products', async(req,res)=>{
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else{
                const products = await cursor.toArray();
            }
            
            
            res.send({
                count,
                products
            });

        });
        // use POST to get data by keys 
        app.post('/products/bykeys', async (req,res)=>{
            const keys = req.body;
            const query = {key: {$in: keys}};
            const products = await productCollection.find(query).toArray();
            res.json(products);
        })
        // Add order API
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);

        })
        // Get All Orders 
        app.get('/orders',async(req,res)=>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })
        // Get Single Orders 
        app.get('/orders/:id',async(req,res)=>{
            const id = req.params.id;
            console.log('getting specific service',id);
            const query = {_id: ObjectId(id)};
            const order = await orderCollection.findOne(query);
            res.json(order)

        })

        // use Delete to get Order
        app.delete('/orders/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            
            res.json(result);
        })



    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('Food Gunda.');
});

app.listen(port,()=>{
 console.log('Server Running at port ', port);
})

/*
onetime:
1. heroku account open
2. herku software install

Every project
1. git init
2. .gitignore(node_module, .env)
3. push everything to git 
4. make sure you habe this script on package.json("start": "node index.js")
5. make sure : put process.env.PORT in front of your port Number

command :
1. heroku login
2. heroku create (only one time for a project)
3, git push heroku main
then:
4 heroku >app>settings>add var(DB_User, DB_Pass)

Update Project:

1. save everything check locally
2. git add, git commit -m"", git push
3. git push heroku main
*/