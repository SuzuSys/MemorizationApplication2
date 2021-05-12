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

// begin experience area

app.get("/test", (req, res) => {
  NamesList.find(function (err, result) {
    if (!err) {
      return res.json(result);
    } else {
      return res.status(500).send("faild!!!");
    }
  });
});

app.post("/test", (req, res) => {
  let nameslist = new NamesList();
  nameslist.name = req.body.name;
  nameslist.save(function(err, result) {
    if (!err) {
      return res.json(result);
    }
    else {
      return res.status(500).send("faild!!!")
    }
  });
});

app.delete("/test", (req, res) => {
  NamesList.deleteOne({_id: req.body.id}, function(err, result) {
    if (!err) {
      return res.json(result);
    }
    else {
      return res.status(500).send("faild!!!");
    }
  });
})

// end experience area
app.listen(process.env.PORT || 3000);