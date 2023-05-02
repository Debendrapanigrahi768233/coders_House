import axios from "axios";
//All the endpoints in our application/ url we will keep here...in sorted
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

//List of all the endpoints
export const sendOtp = (data) => {
  return api.post("/api/send-otp", data);
};

export const verifyOtp = (data) => {
  return api.post("/api/verify-otp", data);
};

export const activate = (data) => {
  return api.post("/api/activate", data);
};

export default api;
