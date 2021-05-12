import Api from "./index";

export default {
  getNamesData() {
    return Api().get("/test");
  },
  postNamesData(data) {
    return Api().post("/test", data);
  },
  deleteNamesData(id_obj) {
    return Api().delete("/test", {data: id_obj});
  }
}