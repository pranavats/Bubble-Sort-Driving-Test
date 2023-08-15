import axios from "axios";

const client = axios.create({
  baseURL: null, // Base Link to backend
});

export default client;
