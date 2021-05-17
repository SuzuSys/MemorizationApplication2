const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// const NamesList = require("./models/module");
const schema_obj = require("./models/module");
const Cell = schema_obj.cell;
const Directory = schema_obj.directory;

const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// mongoose.connect("mongodb://localhost/test", connectOption);
mongoose.connect("mongodb://localhost/MemorizationApplication", connectOption);
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

/*
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
*/

app.get("/MemorizationApplication", (req, res) => {
  Directory.find(function (err, result) {
    if (!err) {
      return res.json(result);
    }
    else {
      return res.status(500).send("faild!!!");
    }
  });
});

app.post("/MemorizationApplication", (req, res) => {
  let directory = new Directory();
  directory.type = "r";
  directory.name = req.body.name;
  directory.save(function(err, result) {
    if (!err) {
      return res.json(result);
    }
    else {
      return res.status(500).send("faild!!!");
    }
  });
});

app.delete("/MemorizationApplication", (req, res) => {
  Directory.deleteOne({_id: req.body.id}, function(err, result) {
    if (!err) {
      return res.json(result);
    }
    else {
      return res.status(500).send("faild!!!");
    }
  })
})


app.listen(process.env.PORT || 3000);