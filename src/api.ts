import axios from "axios";

export const api = axios.create({
    baseURL: "https://posts-db-node.onrender.com/api",
});
