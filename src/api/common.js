import axios from "axios";

const apiURIScheme = "http://ec2-13-125-229-136.ap-northeast-2.compute.amazonaws.com:3050/";

export default {
  send: async (url) => {
    const requestUrl = apiURIScheme + url;

    console.log("URL :", requestUrl);

    return await axios.get(requestUrl);
  },
};
