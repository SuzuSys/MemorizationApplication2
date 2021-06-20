import TextApi from "./TextApi";
import ImageApi from "./ImageApi"
const PngApi = ImageApi().png;

export default {
  async getPng() {
    let obj = {};
    obj.requestType = 'image';
    return await PngApi.get("/MemorizationApplication", {params: obj});
  },
  // ok
  async postFormData(files) {
    const formData = new FormData();
    formData.append('bodytest', 'ok');
    for (let i = 0; i < files.length; i++) {
      formData.append('file[]', files[i]);
    }
    return await TextApi().post("/ImageFileSystem", formData, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    });
  },
  // ok
  async getDirectoryTree() {
    // require bool of is_migrating
    let obj = {};
    obj.requestType = 'text';
    obj.want = "directoryTree";
    return await TextApi().get("/MemorizationApplication", {params: obj});
  },
  // ok
  async getCellTree(parentDirectory) {
    // require a _id of parentDirectory
    let obj = {};
    obj.requestType = 'text';
    obj.want = "cellTree";
    obj.parentDirectory = parentDirectory;
    return await TextApi().get("/MemorizationApplication", {params: obj});
  },
  // ok
  async getCellLayer(obj) {
    // require key 'parentDirectory', 'isextype'
    obj.requestType = 'text';
    obj.want = "cellLayer";
    return await TextApi().get("/MemorizationApplication", {params: obj});
  }, 
  // ok
  async addDirectory(data) {
    // require key 'type', 'name' (require key 'parent' in case of type !== 'r')
    data.isAdd = true;
    data.isDirectory = true;
    return await TextApi().post("/MemorizationApplication", data);
  },
  // ok
  async addRootCell(data) {
    // require key 'parentDirectory', 'label', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = true;
    data.isDirectory = false;
    data.isRoot = true;
    return await TextApi().post("/MemorizationApplication", data);
  },
  // ok
  async addNodeCell(data) {
    // require key 'parentDirectory', 'label', 'parent', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = true;
    data.isDirectory = false;
    data.isRoot = false;
    return await TextApi().post("/MemorizationApplication", data);
  },
  // ok
  async renameDirectory(data) {
    // require key 'id' 'name'
    data.isAdd = false;
    data.isDirectory = true;
    data.want = 'rename';
    return await TextApi().post("/MemorizationApplication", data);
  },
  // ok
  async migrateDirectory(data) {
    // require key 'id', 'to'
    data.isAdd = false;
    data.isDirectory = true;
    data.want = 'migrate';
    return await TextApi().post("/MemorizationApplication", data);
  },
  async correctCell(data) {
    // require key 'parentDirectory', 'id','label', 'isnumerical', 'x', 'x_class', 'y', 'y_class', ('img')
    data.isAdd = false;
    data.isDirectory = false;
    data.want = 'correct';
    return await TextApi().post("/MemorizationApplication", data);
  },
  // ok
  async deleteDirectory(data) {
    // require key 'id'
    data.isDirectory = true;
    return await TextApi().delete("/MemorizationApplication", {data: data});
  },
  async deleteCell(data) {
    // require key 'id', 'parentDirectory'
    // require that target's children is empty
    data.isDirectory = false;
    return await TextApi().delete("/MemorizationApplication", {data: data});
  }
}