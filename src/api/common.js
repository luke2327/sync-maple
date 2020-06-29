import axios from "axios";

const apiURIScheme = "http://localhost:3050/";

export default {
  send: async (url) => {
    const requestUrl = apiURIScheme + url;

    console.log("URL :", requestUrl);

    return await axios.get(requestUrl);
  },
};