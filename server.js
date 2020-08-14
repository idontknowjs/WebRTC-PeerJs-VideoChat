const express = require("express");
const app = express();

// const cors = require('cors')
// app.use(cors())

const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require("uuid");

// const path = require("path");
// app.use(express.static(path.join(__dirname, "..", "build")));

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));

// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "..", "build", "index.html"));
// });

//Can set the room number here.
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    // socket.on("share", (stream) => {
    //   socket.to(roomId).broadcast.emit("screenShared", stream);
    // });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
