const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NamesListSchema = Schema({ name: String }, { collection: "collectionTest" });
module.exports = mongoose.model("NamesList", NamesListSchema);