import axios from "axios";

// const baseURL = process.env.NODE_ENV === "production"
//     // ? "/api/v1/restaurants"
//     // : "http://localhost:3001/api/v1/restaurants";
//     // ? "/"
//     && "http://localhost:3001";

// const baseURL = process.env.NODE_ENV === "development"
//     ? "http://localhost:3001"
//     : "/"

const baseURL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:3001/api";

export default axios.create({
  baseURL,
  // baseURL: "http://localhost:3001"
})
