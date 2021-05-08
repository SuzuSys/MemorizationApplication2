import Api from "./index";

export default {
  getNamesData() {
    return Api().get("/test");
  }
}