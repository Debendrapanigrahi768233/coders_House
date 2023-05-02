require("dotenv").config();
const dbConnect = require("./database");
const express = require("express");
const app = express();
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

const optionCors = {
  credentials: true,
  origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
};
app.use(cors(optionCors));

const PORT = process.env.PORT || 5500;
dbConnect();

//so that we can accept json data
app.use(express.json({ limit: "8mb" }));
//Registering thge routes
app.use(router);

app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.use("/storage", express.static("storage"));

app.listen(PORT, () => {
  console.log(
    `Connected to the server successfully & listening on port ${PORT}`
  );
});
