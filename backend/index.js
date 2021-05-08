const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const NamesList = require("./models/module");

const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect("mongodb://localhost/test", connectOption);
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/test", (req, res) => {
  NamesList.find(function (err, result) {
    if (!err) {
      return res.json(result);
    } else {
      return res.status(500).send("post mylist faild");
    }
  })
})

app.listen(process.env.PORT || 3000);