const mongoose = require("mongoose");

const dbConnect = () => {
  const dbUrl = process.env.DB_URL;
  //database connection
  mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Db is connected");
  });
};

module.exports = dbConnect;
