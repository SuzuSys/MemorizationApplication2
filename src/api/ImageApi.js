import axios from "axios";

export default () => {
  return {
    png: axios.create({
      baseURL: 'http://localhost:3000/',
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'image/png'
      }
    })
    // svgとかjpgとか追加したい
  };
};