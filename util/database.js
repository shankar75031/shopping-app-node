const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  const url = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.edrzp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  console.log(url);
  MongoClient.connect(url)
    .then((client) => {
      console.log("Connected");
      callback(client);
    })
    .catch((err) => console.error(err));
};

module.exports = mongoConnect;
