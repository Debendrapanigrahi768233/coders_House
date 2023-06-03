const mongoose = require("mongoose");

const dbConnect = () => {
  console.log("coming here...", process.env.DB_URL);
  const dbUrl = process.env.DB_URL;
  //database connection
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(dbUrl);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Db is connected");
  });
};

module.exports = dbConnect;
