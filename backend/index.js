const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const schema_obj = require("./models/module");
const Cell = schema_obj.cell;
const Directory = schema_obj.directory;
// begin{debug setting}
const fs = require("fs-extra");
const out = fs.createWriteStream("info.log");
const logger = new console.Console(out);
logger.log('---ERROR STORAGE---');
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'image_temp/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({storage: storage});

app.get("/getDirectoryTree", (req, res) => {
  (async () => {
    try {
      const tree = [];
      const root = await Directory.find({type: 'r'}).exec();
      for (let i = 0; i < root.length; i++) {
        tree.push(await DirectoryToObject(root[i]));
      }
      res.json(tree);
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});
async function DirectoryToObject(obj) {
  const piece = {label: obj.name, value: obj};
  piece.isleaf = obj.type === 'l';
  piece.isnotleaf = obj.type !== 'l';
  if (obj.type !== 'l') {
    if (obj.children.length !== 0) {
      piece.children = [];
      let child;
      for (let i = 0; i < obj.children.length; i++) {
        child = await Directory.findOne({_id: obj.children[i]}).exec();
        piece.children.push(await DirectoryToObject(child));
      }
    }
  }
  return piece;
}

app.get("/getCellTree", (req, res) => {
  (async () => {
    try {
      const obj = req.query;
      const tree = [];
      const parentDirectory = await Directory.findOne({_id: obj.parentDirectory}).exec();
      if (parentDirectory.cells.length !== 0) {
        const root = (await Directory.aggregate([
          {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
          {$unwind: "$cells"},
          {$match: {"cells.layer": 0}},
          {$group: {_id: "$_id", data: {$push: "$cells"}}}
        ]).exec())[0].data;
        for (let i = 0; i < root.length; i++) {
          tree.push(await CellToObject(root[i], obj.parentDirectory));
        }
      }
      res.json(tree);
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});
async function CellToObject(obj, parentDirectory) {
  const piece = {label: obj.label, id: obj._id, value: obj};
  piece.children = [];
  let child;
  for (let i = 0; i < obj.children.length; i++) {
    child = (await Directory.aggregate([
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
      const obj = req.query;
      const cellLayer = [];
      const layerLength = (await Directory.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
        {$unwind: "$cells"},
        {$group: {_id: "$cells.layer"}}
      ]).exec()).length;
      const isextype = obj.isextype === 'true';
      let temp, oneOfLayer;
      for (let i = 0; i < layerLength; i++) {
        temp = {label: ('Layer' + i)};
        if (isextype) {
          oneOfLayer = (await Directory.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
            {$unwind: "$cells"},
            {$match: {"cells.layer": i, "cells.isnumerical": false}},
            {$group: {_id: "$_id", data: {$push: "$cells"}}}
          ]).exec());
          temp.disabled = oneOfLayer.length === 0;
          if (temp.disabled) temp.cells = [];
          else temp.cells = oneOfLayer[0].data;
        }
        else {
          temp.cells = (await Directory.aggregate([
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
      res.status(500).send();
    }
  })();
});

app.post("/addDirectory", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const directory = new Directory();
      directory.type = obj.type;
      if (obj.type !== 'r') {
        directory.parent = obj.parent;
        await Directory.updateOne(
          {_id: obj.parent},
          {$addToSet: {children: directory._id}}
        ).exec();
      }
      directory.name = obj.name;
      await directory.save();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/renameDirectory", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      await Directory.updateOne(
        {_id: obj.id},
        {name: obj.name}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/migrateDirectory", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const target = await Directory.findOne({_id: obj.id}).exec();
      await Directory.updateOne(
        {_id: target.parent},
        {$pull: {children: obj.id}}
      ).exec();
      await Directory.updateOne(
        {_id: obj.to},
        {$addToSet: {children: obj.id}}
      ).exec();
      await Directory.updateOne(
        {_id: obj.id},
        {parent: obj.to}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.delete("/deleteDirectory", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const target = await Directory.findOne({_id: obj.id}).exec();
      if (target.children.length === 0) {
        if (target.type !== 'r') {
          await Directory.updateOne(
            {_id: target.parent},
            {$pull: {children: obj.id}}
          ).exec();
          if (target.type === 'l') {
            for (let i = 0; i < target.cells.length; i++) {
              fs.removeSync('image/' + target.cells[i]._id);
            }
          }
        }
        await Directory.deleteOne({_id: obj.id}).exec();
        res.status(200).send();
      }
      else throw new Error();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/addCell", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const cell = new Cell();
      if (obj.isRoot) {
        cell.layer = 0;
      }
      else {
        cell.parent = obj.parent;
        const parent = (await Directory.aggregate([
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
      cell.img = [];
      await Directory.updateOne(
        {_id: obj.parentDirectory},
        {$addToSet: {cells: cell}}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/addCellWithImage", upload.array('file[]'), (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const cell = new Cell();
      const isRoot = obj.isRoot === 'true';
      if (isRoot) {
        cell.layer = 0;
      }
      else {
        cell.parent = obj.parent;
        const parent = (await Directory.aggregate([
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
      const images = [];
      const to_dest = 'image/' + cell._id + '/';
      let present_url, to_url, file_name;
      for (let i = 0; i < req.files.length; i++) {
        file_name = req.files[i].originalname;
        images.push(file_name);
        present_url = 'image_temp/' + file_name;
        to_url = to_dest + file_name;
        fs.moveSync(present_url, to_url);
      }
      cell.img = images;
      await Directory.updateOne(
        {_id: obj.parentDirectory},
        {$addToSet: {cells: cell}}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.get("/getImage", (req, res) => {
  (async () => {
    try {
      const obj = req.query;
      const url = './image/' + obj.id + '/' + obj.filename;
      res.status(200).send(fs.readFileSync(url));
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/correctCell", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const cell = new Cell();
      cell._id = obj.id;
      cell.parentDirectory = obj.parentDirectory;
      const target = (await Directory.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
        {$unwind: "$cells"},
        {$match: {"cells._id": mongoose.Types.ObjectId(obj.id)}},
        {$group: {_id: "$_id", data: {$push: "$cells"}}}
      ]).exec())[0].data[0];
      cell.layer = target.layer;
      cell.img = target.img;
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
      await Directory.updateOne(
        {_id: obj.parentDirectory},
        {$addToSet: {cells: cell}}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.post("/correctCellWithImage", upload.array('file[]'), (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const cell = new Cell();
      cell._id = obj.id;
      cell.parentDirectory = obj.parentDirectory;
      const target = (await Directory.aggregate([
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
      const to_dest = 'image/' + obj.id + '/';
      if ('img' in obj) {
        cell.img = obj.img;
        const unnecessary_img = target.img.filter(i => obj.img.indexOf(i) === -1);
        for (let i = 0; i < unnecessary_img.length; i++) {
          fs.removeSync(to_dest + unnecessary_img);
        }
        let present_url, to_url, file_name;
        for (let i = 0; i < req.files.length; i++) {
          file_name = req.files[i].originalname;
          present_url = 'image_temp/' + file_name;
          to_url = to_dest + file_name;
          fs.moveSync(present_url, to_url);
        }
      }
      else {
        cell.img = [];
        fs.removeSync(to_dest);
      }
      await Directory.updateOne(
        {_id: obj.parentDirectory},
        {$pull: {cells: {_id: obj.id}}}
      ).exec();
      await Directory.updateOne(
        {_id: obj.parentDirectory},
        {$addToSet: {cells: cell}}
      ).exec();
      res.status(200).send();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.delete("/deleteCell", (req, res) => {
  (async () => {
    try {
      const obj = req.body;
      const target = (await Directory.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(obj.parentDirectory)}},
        {$unwind: "$cells"},
        {$match: {"cells._id": mongoose.Types.ObjectId(obj.id)}},
        {$group: {_id: "$_id", data: {$push: "$cells"}}}
      ]).exec())[0].data[0];
      if (target.children.length === 0) {
        if (target.layer !== 0) {
          const parent = (await Directory.aggregate([
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
        await Directory.updateOne(
          {_id: obj.parentDirectory},
          {$pull: {cells: {_id: obj.id}}}
        ).exec();
        fs.removeSync('image/' + obj.id + '/');
        res.status(200).send();
      }
      else throw new Error();
    } catch (err) {
      logger.log(err);
      res.status(500).send();
    }
  })();
});

app.listen(process.env.PORT || 3000);