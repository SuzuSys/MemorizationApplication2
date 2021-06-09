import Api from "./index";

export default {
  async getDirectoryTree() {
    // require bool of is_migrating
    let obj = {};
    obj.want = "directoryTree";
    return await Api().get("/MemorizationApplication", {params: obj});
  },
  async getCellTree(parentDirectory) {
    // require a _id of parentDirectory
    let obj = {};
    obj.want = "cellTree";
    obj.parentDirectory = parentDirectory;
    return await Api().get("/MemorizationApplication", {params: obj});
  },
  async addDirectory(data) {
    // require key 'type', 'name' (require key 'parent' in case of type !== 'r')
    data.isAdd = true;
    data.isDirectory = true;
    return await Api().post("/MemorizationApplication", data);
  },
  async addRootCell(data) {
    // require key 'parentDirectory', 'label', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = true;
    data.isDirectory = false;
    data.isRoot = true;
    return await Api().post("/MemorizationApplication", data);
  },
  async addNodeCell(data) {
    // require key 'parentDirectory', 'label', 'parent', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = true;
    data.isDirectory = false;
    data.isRoot = false;
    return await Api().post("/MemorizationApplication", data);
  },
  async renameDirectory(data) {
    // require key 'id' 'name'
    data.isAdd = false;
    data.isDirectory = true;
    data.want = 'rename';
    return await Api().post("/MemorizationApplication", data);
  },
  async migrateDirectory(data) {
    // require key 'id', 'to'
    data.isAdd = false;
    data.isDirectory = true;
    data.want = 'migrate';
    return await Api().post("/MemorizationApplication", data);
  },
  async correctCell(data) {
    // require key 'parentDirectory', 'id','label', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = false;
    data.isDirectory = false;
    data.want = 'correct';
    return await Api().post("/MemorizationApplication", data);
  },
  async deleteDirectory(data) {
    // require key 'id'
    data.isDirectory = true;
    return await Api().delete("/MemorizationApplication", {data: data});
  },
  async deleteCell(data) {
    // require key 'id', 'parentDirectory'
    // require that target's children is empty
    data.isDirectory = false;
    return await Api().delete("/MemorizationApplication", {data: data});
  }
}