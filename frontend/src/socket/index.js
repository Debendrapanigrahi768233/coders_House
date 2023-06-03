import { io } from "socket.io-client";

const socketInit = () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  return io("http://localhost:5500", options);
};

export default socketInit;

//io(process.env.REACT_APP_BACKEND_URL,options) this will return the instance of the socket.io-client so we can call the initSocket function to use the instance and we can emit the event and send the data
