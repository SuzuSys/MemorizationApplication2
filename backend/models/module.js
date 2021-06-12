const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CellSchema = Schema(
  {
    label: {type: String},
    layer: {type: Number},
    parentDirectory: {type: Schema.Types.ObjectId, ref: "Directory"},
    parent: {type: Schema.Types.ObjectId, ref: "Cell"},
    children: [{type: Schema.Types.ObjectId, ref: "Cell"}],
    isnumerical: {type: Boolean},
    x: {type: String},
    x_class: {type: String},
    y: {type: String},
    y_class: {type: String},
    img: [{type: String}]
  }, 
  {
    collection: "sheets"
  }
);

const DirectorySchema = Schema(
  {
    type: {type: String}, // 'r', 'n', 'l'
    name: {type: String},
    parent: {type: Schema.Types.ObjectId, ref: "Directory"},
    children: [{type: Schema.Types.ObjectId, ref: "Directory"}],
    cells: [{type: CellSchema}]
  },
  {
    collection: "sheets"
  }
);
module.exports = {
  cell: mongoose.model("Cell", CellSchema),
  directory: mongoose.model("Directory", DirectorySchema)
};