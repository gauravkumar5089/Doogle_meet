const express = require("express");
const app = express();
const ejs = require("ejs");
const { v4: uuidv4 } = require("uuid");
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

app.use("/peerjs", peerServer);
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/room", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:roomId", (req, res) => {
  res.render("room", { roomId: req.params.roomId });
});

server.listen(3030, () => {
  console.log("Server is running on port 3030");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("New user connected with id: " + userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });

    socket.on("chat-message", (message) => {
      console.log(message);
      io.to(roomId).emit("createMessage", message);
    });
  });
});
