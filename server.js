const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
  const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

const mongoUrlLocal = "mongodb://admin:admin@localhost:27017";
const mongoUrlDocker = "mongodb://admin:admin@mongodb";
const databaseName = "my-db";

const connectToMongo = async (url) => {
  try {
    const client = await MongoClient.connect(url);
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};

app.post('/update-profile', async (req, res) => {
  const userObj = req.body;

  try {
    const client = await connectToMongo(mongoUrlLocal);
    const db = client.db(databaseName);
    userObj['userid'] = 1;

    const myquery = { userid: 1 };
    const newvalues = { $set: userObj };

    await db.collection("users").updateOne(myquery, newvalues, { upsert: true });
    client.close();

    res.send(userObj);
  } catch (error) {
    res.status(500).send("Error updating profile");
  }
});

app.get('/get-profile', async (req, res) => {
  try {
    const client = await connectToMongo(mongoUrlLocal);
    const db = client.db(databaseName);

    const myquery = { userid: 1 };
    const result = await db.collection("users").findOne(myquery);
    client.close();

    res.send(result ? result : {});
  } catch (error) {
    res.status(500).send("Error getting profile");
  }
});

app.listen(3000, () => {
  console.log("app listening on port 3000!");
});
