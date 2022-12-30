const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mktejfv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const tasksCollection = client.db('task-manager').collection('tasks');

        //inserting a task
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            // console.log(task);
            const result = await tasksCollection.insertOne(task);
            res.send(result);
        });

        //getting all users tasks
        /* app.get('/tasks', async (req, res) => {
            const query = {};
            const tasks = await tasksCollection.find(query).toArray();
            res.send(tasks);
        }); */

        //getting user specified tasks
        app.get('/tasks', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email: email };
            const tasks = await tasksCollection.find(query).toArray();
            res.send(tasks);
        });

        //getting a specific review
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const task = await tasksCollection.findOne(query);
            res.send(task);
        });

        //updating a task
        app.put('/tasks/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const prevTask = req.body;
            // console.log(prevReview);

            const option = { upsert: true };
            const updatedTask = {
                $set: {
                    task_name: prevTask.task_name,
                    img: prevTask.img,
                    posted_date: prevTask.posted_date,
                    posted_time: prevTask.posted_time,
                }
            }

            const result = await tasksCollection.updateOne(query, updatedTask, option);
            res.send(result);

        });



        //updating a comment
        app.put('/tasks/updatecomment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const commentObj = req.body;
            // console.log(commentObj);

            const option = { upsert: true };
            const updatedTask = {
                $set: {
                    comment: commentObj.comment,
                }
            }

            const result = await tasksCollection.updateOne(query, updatedTask, option);
            res.send(result);

        });

        //deleting a task
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            res.send(result);
        });

        ///task status changing
        app.put('/tasks/updatestatus/:id', async (req, res) => {
            const taskStatus = req.query.status;
            // console.log(taskStatus);

            const id = req.params.id;
            const queryId = { _id: ObjectId(id) };
            const options = { upsert: true };
            let updatedDoc;
            updatedDoc = {
                $set: {
                    status: taskStatus,
                }
            };



            const result = await tasksCollection.updateOne(queryId, updatedDoc, options);
            res.send(result);
        });


        //getting user specified completed tasks
        app.get('/completedtasks', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query =
            {
                email: email,
                status: "Completed"
            };
            const completedTasks = await tasksCollection.find(query).toArray();
            res.send(completedTasks);
        });



    }
    finally {

    }
};


run().catch(error => console.log(error));



app.get('/', (req, res) => {
    res.send('Task Manager server is running!');
});

app.listen(port, () => {
    console.log(`Task Manager is running on port: ${port}`);
});