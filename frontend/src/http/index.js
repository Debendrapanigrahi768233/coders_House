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

export const logout = () => {
  return api.post("/api/logout");
};

export const createRoom = (data) => api.post("/api/rooms", data);
export const getAllRooms = () => api.get("/api/rooms");
export const getRoom = (roomId) => api.get(`/api/rooms/${roomId}`);

//Interceptors
api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(originalRequest);
    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;
      console.log("--------------------***---------------------");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/refresh`,
          {
            withCredentials: true,
          }
        );
        console.log("--------------------***---------------------");
        return api.request(originalRequest);
      } catch (err) {
        console.log(err.message);
      }
    }
    throw error;
  }
);

export default api;
