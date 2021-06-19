const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const schema_obj = require("./models/module");
const Cell = schema_obj.cell;
const Directory = schema_obj.directory;
// begin{debug setting}
const fs = require("fs");
const out = fs.createWriteStream("info.log");
const logger = new console.Console(out);
logger.log('Can you looking this sentence?');
// end{debug setting}

const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect("mongodb://localhost/MemorizationApplication", connectOption);
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/getDirectoryTree", (req, res) => {
  (async () => {
    try {
      let tree = [];
      let root = await Directory.find({type: 'r'}).exec();
      for (let i = 0; i < root.length; i++) {
        tree.push(await DirectoryToObject(root[i]));
      }
      res.json(tree);
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});
async function DirectoryToObject(obj) {
  let piece = {label: obj.name, value: obj};
  if (obj.type === 'l') {
    piece.isleaf = true;
    piece.isnotleaf = false;
  } 
  else {
    piece.isleaf = false;
    piece.isnotleaf = true;
    if (obj.children.length !== 0) {
      piece.children = [];
      for (let i = 0; i < obj.children.length; i++) {
        let child = await Directory.findOne({_id: obj.children[i]}).exec();
        piece.children.push(await DirectoryToObject(child));
      }
    }
  }
  return piece;
}

app.get("/getCellTree", (req, res) => {
  (async () => {
    try {
      let obj = req.query;
      let tree = [];
      let parentDirectory = await Directory.findOne({_id: obj.parentDirectory}).exec();
      if (parentDirectory.cells.length !== 0) {
        let root = (await Directory.aggregate([
          {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
          {$unwind: "$cells"},
          {$match: {"cells.layer": 0}},
          {$group: {_id: "$_id", data: {$push: "$cells"}}}
        ]).exec())[0].data;
        for (let i = 0; i < root.length; i++) {
          let rootObj = await CellToObject(root[i], obj.parentDirectory);
          tree.push(rootObj);
        }
      }
      res.json(tree);
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});
async function CellToObject(obj, parentDirectory) {
  let piece = {label: obj.label, id: obj._id, value: obj};
  piece.children = [];
  for (let i = 0; i < obj.children.length; i++) {
    let child = (await Directory.aggregate([
      {$match: {_id: mongoose.Types.ObjectId(parentDirectory)}},
      {$unwind: "$cells"},
      {$match: {"cells._id": mongoose.Types.ObjectId(obj.children[i])}},
      {$group: {_id: "$_id", data: {$push: "$cells"}}}
    ]).exec())[0].data[0];
    piece.children.push(await CellToObject(child, parentDirectory));
  }
  return piece;
}

app.get("/getCellLayer", (req, res) => {
  (async () => {
    try {
      let obj = req.query;
      let cellLayer = [];
      let layerLength = (await Directory.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
        {$unwind: "$cells"},
        {$group: {_id: "$cells.layer"}}
      ]).exec()).length;
      let isextype = obj.isextype === 'true';
      for (let i = 0; i < layerLength; i++) {
        let temp = {label: ('Layer' + i)};
        if (isextype) {
          let oneOfLayer = (await Directory.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
            {$unwind: "$cells"},
            {$match: {"cells.layer": i, "cells.isnumerical": false}},
            {$group: {_id: "$_id", data: {$push: "$cells"}}}
          ]).exec());
          temp.disabled = oneOfLayer.length === 0;
          if (temp.disabled) temp.value = [];
          else temp.value = oneOfLayer[0].data;
        }
        else {
          temp.value = (await Directory.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
            {$unwind: "$cells"},
            {$match: {"cells.layer": i}},
            {$group: {_id: "$_id", data: {$push: "$cells"}}}
          ]).exec())[0].data;
          temp.disabled = false;
        }
        cellLayer.push(temp);
      }
      res.json(cellLayer);
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.post("/addDirectory", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      let directory = new Directory();
      directory.type = obj.type;
      if (obj.type != 'r') {
        directory.parent = obj.parent;
        await Directory.updateOne(
          {_id: obj.parent},
          {$addToSet: {children: directory._id}}
        ).exec();
      }
      directory.name = obj.name;
      res.json(await directory.save());
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.post("/renameDirectory", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      res.json(await Directory.updateOne(
        {_id: obj.id},
        {name: obj.name}
      ).exec());
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.post("/migrateDirectory", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      let target = await Directory.findOne({_id: obj.id}).exec();
      await Directory.updateOne(
        {_id: target.parent},
        {$pull: {children: obj.id}}
      ).exec();
      await Directory.updateOne(
        {_id: obj.to},
        {$addToSet: {children: obj.id}}
      ).exec();
      res.json(await Directory.updateOne(
        {_id: obj.id},
        {parent: obj.to}
      ).exec());
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.delete("/deleteDirectory", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      let target = await Directory.findOne({_id: obj.id}).exec();
      if (target.children.length === 0) {
        if (target.type !== 'r') {
          await Directory.updateOne(
            {_id: target.parent},
            {$pull: {children: obj.id}}
          ).exec();
        }
        res.json(await Directory.deleteOne({_id: obj.id}).exec());
      }
      else throw new Error();
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    logger.log(req.body.bodytest);
    cb(null, 'image/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({storage: storage});
app.post("/ImageFileSystem", upload.array('file[]'), (req, res) => {
  (async () => {
    try {
      logger.log(req.files);
      logger.log(req.body);
    } catch (err) {
      logger.log(err);
    }
  })();
});

app.get("/MemorizationApplication", (req, res) => {
  (async () => {
    try {
      if (Object.keys(req.query).length === 0) {
        let data = await Directory.find({}).exec();
        res.json(data);
      }
      else {
        let obj = req.query;
        if (obj.requestType === 'text') {
          let tree = [];
          let root;
          switch (obj.want) {
            case 'directoryTree':
              root = await Directory.find({type: 'r'}).exec();
              for (let i = 0; i < root.length; i++) {
                tree.push(await DirectoryToObject(root[i]));
              }
              res.json(tree);
              break;
            case 'cellTree':
              let parentDirectory = await Directory.findOne({_id: obj.parentDirectory}).exec();
              if (parentDirectory.cells.length !== 0) {
                root = (await Directory.aggregate([
                  {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
                  {$unwind: "$cells"},
                  {$match: {"cells.layer": 0}},
                  {$group: {_id: "$_id", data: {$push: "$cells"}}}
                ]).exec())[0].data;
                for (let i = 0; i < root.length; i++) {
                  let rootObj = await CellToObject(root[i], obj.parentDirectory);
                  tree.push(rootObj);
                }
              }
              res.json(tree);
              break;
            case 'cellLayer':
              let cellLayer = [];
              let layerLength = (await Directory.aggregate([
                {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
                {$unwind: "$cells"},
                {$group: {_id: "$cells.layer"}}
              ]).exec()).length;
              let isextype = obj.isextype === 'true';
              for (let i = 0; i < layerLength; i++) {
                let temp = {label: ('Layer' + i)};
                if (isextype) {
                  let oneOfLayer = (await Directory.aggregate([
                    {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
                    {$unwind: "$cells"},
                    {$match: {"cells.layer": i, "cells.isnumerical": false}},
                    {$group: {_id: "$_id", data: {$push: "$cells"}}}
                  ]).exec());
                  temp.disabled = oneOfLayer.length === 0;
                  if (temp.disabled) temp.value = [];
                  else temp.value = oneOfLayer[0].data;
                }
                else {
                  temp.value = (await Directory.aggregate([
                    {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
                    {$unwind: "$cells"},
                    {$match: {"cells.layer": i}},
                    {$group: {_id: "$_id", data: {$push: "$cells"}}}
                  ]).exec())[0].data;
                  temp.disabled = false;
                }
                cellLayer.push(temp);
              }
              res.json(cellLayer);
              break;
            default:
              throw new Error();
          }
        }
        else {
          // getPng Test
          res.status(200).send(fs.readFileSync("./image/check.png"));
        }
      }
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.post("/MemorizationApplication", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      logger.log(req);
      if (obj.isAdd) {
        if (obj.isDirectory) {
          let directory = new Directory();
          directory.type = obj.type;
          if (obj.type !== 'r') {
            directory.parent = obj.parent;
            await Directory.updateOne(
              {_id: obj.parent},
              {$addToSet: {children: directory._id}}
            ).exec();
          }
          directory.name = obj.name;
          res.json(await directory.save());
        }
        else {
          let cell = new Cell();
          if (obj.isRoot) {
            cell.layer = 0;
          }
          else {
            cell.parent = obj.parent;
            let parent = (await Directory.aggregate([
              {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
              {$unwind: "$cells"},
              {$match: {"cells._id": mongoose.Types.ObjectId(obj.parent)}},
              {$group: {_id: "$_id", data: {$push: "$cells"}}}
            ]).exec())[0].data[0];
            await Directory.updateOne(
              {_id: obj.parentDirectory},
              {$pull: {cells: {_id: obj.parent}}}
            ).exec();
            parent.children.push(cell._id);
            await Directory.updateOne(
              {_id: obj.parentDirectory},
              {$addToSet: {cells: parent}}
            ).exec();
            cell.layer = parent.layer + 1;
          }
          cell.parentDirectory = obj.parentDirectory;
          cell.label = obj.label;
          cell.isnumerical = obj.isnumerical;
          cell.x = obj.x;
          cell.x_class = obj.x_class;
          cell.y = obj.y;
          cell.y_class = obj.y_class;
          // cell.img = obj.img;
          res.json(await Directory.updateOne(
            {_id: obj.parentDirectory},
            {$addToSet: {cells: cell}}
          ).exec());
        }
      }
      else {
        if (obj.isDirectory) {
          switch (obj.want) {
            case 'rename':
              res.json(await Directory.updateOne(
                {_id: obj.id},
                {name: obj.name}
              ).exec());
              break;
            case 'migrate':
              let target = await Directory.findOne({_id: obj.id}).exec();
              await Directory.updateOne(
                {_id: target.parent},
                {$pull: {children: obj.id}}
              ).exec();
              await Directory.updateOne(
                {_id: obj.to},
                {$addToSet: {children: obj.id}}
              ).exec();
              res.json(await Directory.updateOne(
                {_id: obj.id},
                {parent: obj.to}
              ).exec());
              break;
            default:
              throw new Error();
          }
        }
        else {
          switch (obj.want) {
            case 'correct':
              let cell = new Cell();
              cell._id = obj.id;
              cell.parentDirectory = obj.parentDirectory;
              let target = (await Directory.aggregate([
                {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
                {$unwind: "$cells"},
                {$match: {"cells._id": mongoose.Types.ObjectId(obj.id)}},
                {$group: {_id: "$_id", data: {$push: "$cells"}}}
              ]).exec())[0].data[0];
              cell.layer = target.layer;
              if (target.layer > 0) cell.parent = target.parent;
              cell.children = target.children;
              cell.label = obj.label;
              cell.isnumerical = obj.isnumerical;
              cell.x = obj.x;
              cell.x_class = obj.x_class;
              cell.y = obj.y;
              cell.y_class = obj.y_class;
              await Directory.updateOne(
                {_id: obj.parentDirectory},
                {$pull: {cells: {_id: obj.id}}}
              ).exec();
              res.json(await Directory.updateOne(
                {_id: obj.parentDirectory},
                {$addToSet: {cells: cell}}
              ).exec());
              break;
            // case 'correctImg'
            default:
              throw new Error();
          }
        }
      }
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});

app.delete("/MemorizationApplication", (req, res) => {
  (async () => {
    try {
      let obj = req.body;
      let target;
      if (obj.isDirectory) {
        target = await Directory.findOne({_id: obj.id}).exec();
        if (target.children.length === 0) {
          if (target.type !== 'r') {
            await Directory.updateOne(
              {_id: target.parent},
              {$pull: {children: obj.id}}
            ).exec();
          }
          res.json(await Directory.deleteOne({_id: obj.id}).exec());
        }
        else throw new Error();
      }
      else {
        target = (await Directory.aggregate([
          {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
          {$unwind: "$cells"},
          {$match: {"cells._id": mongoose.Types.ObjectId(obj.id)}},
          {$group: {_id: "$_id", data: {$push: "$cells"}}}
        ]).exec())[0].data[0];
        if (target.children.length === 0) {
          if (target.layer !== 0) {
            let parent = (await Directory.aggregate([
              {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
              {$unwind: "$cells"},
              {$match: {"cells._id": mongoose.Types.ObjectId(target.parent)}},
              {$group: {_id: "$_id", data: {$push: "$cells"}}}
            ]).exec())[0].data[0];
            await Directory.updateOne(
              {_id: obj.parentDirectory},
              {$pull: {cells: {_id: parent._id}}}
            ).exec();
            parent.children.splice(parent.children.indexOf(obj.id), 1);
            await Directory.updateOne(
              {_id: obj.parentDirectory},
              {$addToSet: {cells: parent}}
            ).exec();
          }
          res.json(await Directory.updateOne(
            {_id: obj.parentDirectory},
            {$pull: {cells: {_id: obj.id}}}
          ).exec());
        }
        else throw new Error();
      }
    } catch (err) {
      logger.log(err);
      res.status(500).send("faild");
    }
  })();
});
app.listen(process.env.PORT || 3000);