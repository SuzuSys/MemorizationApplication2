import axios from "axios";

export default {
  Base: function() {
    return axios.create({
      baseURL: 'http://localhost:3000/'
    });
  },
  Blob: function() {
    return axios.create({
      baseURL: 'http://localhost:3000/',
      responseType: 'blob'
    })
  }
}