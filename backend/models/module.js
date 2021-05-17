const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/*
const NamesListSchema = Schema({ name: String }, { collection: "collectionTest" });
module.exports = mongoose.model("NamesList", NamesListSchema);
*/

const CellSchema = Schema(
  {
    id: {type: Schema.Types.ObjectId},
    layer: {type: Number},
    parent: {type: Schema.Types.ObjectId, ref: "Cell"},
    children: [{type: Schema.Types.ObjectId, ref: "Cell"}],
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