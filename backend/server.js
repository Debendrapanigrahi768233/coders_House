require("dotenv").config();
const dbConnect = require("./database");
const express = require("express");
const app = express();
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ACTIONS = require("./actions");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    // origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
  },
});

//-------------------------------------------------------------------------------------------------------------------
app.use(cookieParser());
const optionCors = {
  credentials: true,
  origin: [process.env.FRONT_URL],
  // origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
};
app.use(cors(optionCors));

const PORT = process.env.PORT || 5500;
dbConnect();

//so that we can accept json data
app.use(express.json({ limit: "8mb" }));
//Registering thge routes
app.use(router);

app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.use("/storage", express.static("storage"));
//-------------------------------------------------------------------------------------------------
const socketUserMapping = {};
io.on("connection", (socket) => {
  console.log("#####New Connection####### :", socket.id);
  socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
    socketUserMapping[socket.id] = user;

    //Add this socket to the roomId, but before that for all other socket in that roomId inform that new client Joined to display in their UI.
    //all connected clients/users in that room --->this list of users is nothing but a list of socketIds
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    console.log("Clients from server...:", clients);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.ADD_PEER, {
        peerId: socket.id, //I am saying I have joined so here is me and take my Id
        createOffer: false, //no need to create the offer
        user: user, //I am the user who is Joining the room
      });

      //Now i will add myself to the room
      socket.emit(ACTIONS.ADD_PEER, {
        peerId: clientId, //this client I have to add in my Ui
        createOffer: true, //I will create the offer
        user: socketUserMapping[clientId], //Here is that client details
      });
    });

    socket.join(roomId);
  });

  //Handle Relay Ice
  //Here icecandidate we will receive from some peer from client side and our work is to forward to that peerId our socket Id and the same icecandidate
  //This ice Candidate is our own socket connection ice candidate
  socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
      peerId: socket.id,
      icecandidate,
    });
  });

  //Handle Relay sdp
  //This sdp is our own socket connection sdp
  socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  //remove peer on leaving the room
  // const leaveRoom = ({ roomId }) => {
  //   const { rooms } = socket;
  //   Array.from(rooms).forEach((roomId) => {
  //     const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  //     console.log("Here i reached....leaveRoom");
  //     clients.forEach((clientId) => {
  //       console.log(clientId, "-------------", socket.id);
  //       console.log("id---->", socketUserMapping[socket.id]);
  //       io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
  //         //telling other browser client to remove me from its list
  //         peerId: socket.id,
  //         userId: socketUserMapping[socket.id]?.id,
  //       });
  //       console.log("id---->", socketUserMapping[clientId]);
  //       socket.emit(ACTIONS.REMOVE_PEER, {
  //         //telling my browser to remove client
  //         peerId: clientId,
  //         userId: socketUserMapping[clientId]?.id,
  //       });
  //     });
  //     socket.leave(roomId);
  //   });

  //   delete socketUserMapping[socket.id];
  // };

  socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.MUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });

  socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.UNMUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });

  const leaveRoom = () => {
    const { rooms } = socket;
    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((clientId) => {
        console.log(clientId, "-------", socketUserMapping[socket.id]);
        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
          peerId: socket.id,
          userId: socketUserMapping[socket.id]?.id,
        });

        socket.emit(ACTIONS.REMOVE_PEER, {
          peerId: clientId,
          userId: socketUserMapping[clientId]?.id,
        });
      });
      socket.leave(roomId);
    });
    delete socketUserMapping[socket.id];
  };
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);
});

server.listen(PORT, () => {
  console.log(
    `----------------------------------------------Connected to the server successfully & listening on port ${PORT}----------------------------------------`
  );
});
