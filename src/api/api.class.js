import api from "./common";

const defaultApiURI = 'https://maple.gg/';

export default {
  syncMaple: async (params) => {
    const uri = `${defaultApiURI}u/${encodeURI(params.name)}/sync`;

    return await api.send(uri);
  },

  searchMaple: async (params) => {
    const uri = `${defaultApiURI}u/${encodeURI(params.name)}`;

    return await api.send(uri);
  },
};
