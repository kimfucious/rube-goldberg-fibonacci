const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// // Mongo Setup
// const MongoClient = require('mongodb').MongoClient
// const mongoclient = new MongoClient(new Server("mongo", 27017), {native_parser: true});

// MongoClient.connect('mongodb://mongo:27017/api', function (err, client) {
//   if (err) throw err

//   var db = client.db('api')

//   db.collection('values').find().toArray(function (err, result) {
//     if (err) throw err

//     console.log(result)
//   })
// })

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on("error", () => console.log("Lost PG connection"));

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch(err => console.log(err));

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Aloha!");
});

app.get("/values/all", async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * from values");
    res.send(values.rows);
  } catch (e) {
    console.log("pgClient query error: ", e);
  }
});

app.get("/values/current", async (req, res) => {
  try {
    redisClient.hgetall("values", (err, values) => {
      res.send(values);
    });
  } catch (e) {
    console.log("redisClient error:", e);
  }
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 200) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Not calculated yet...");
  redisPublisher.publish("insert", index);
  const pgInsertResult = await pgClient.query(
    "INSERT INTO values(number) VALUES($1)",
    [index]
  );
  res.send("Hamsters are calculating!");
});

app.post("/values/clear", async (req, res) => {
  try {
    await redisClient.flushall();
    await pgClient.query("DROP TABLE values");
    await pgClient.query("CREATE TABLE values (number INT)");
    return res.status(200).send("databases cleared");
  } catch (e) {
    console.log(e);
  }
});

app.listen(5000, err => {
  console.log("Listening on port 5000");
});
