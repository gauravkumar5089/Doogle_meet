const videoGrid = document.querySelector(".video-grid");
const socket = io("/");

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

const peers = {};

// let localStream;

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((localStream) => {
      const video = document.createElement("video");
      video.muted = true;
      handleStream(video, localStream);
      socket.on("user-connected", (userId) => {
        connectNewUser(userId, localStream);
      });

      peer.on("call", (call) => {
        call.answer(localStream);
        const video = document.createElement("video");
        call.on("stream", (remoteStream) => {
          handleStream(video, remoteStream);
        });
        call.on("close", () => {
          video.remove();
        });
      });
    })
    .catch((err) => {
      console.log("u got an error:" + err);
    });
}

socket.on("user-disconnected", (userId) => {
  // console.log(userId);
  if (peers[userId]) peers[userId].close();
});

function connectNewUser(userId, localStream) {
  // console.log("New user connected with id: " + userId);
  const call = peer.call(userId, localStream);
  const video = document.createElement("video");
  call.on("stream", (remoteStream) => {
    handleStream(video, remoteStream);
  });
  call.on("close", () => {
    video.remove();
    // console.log("call closed");
  });

  peers[userId] = call;
}

function handleStream(video, stream) {
  // const video = document.createElement("video");
  // video.muted = true;
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

peer.on("open", (userId) => {
  console.log(userId);
  socket.emit("join-room", roomId, userId);
});

getLocalStream();

//Chat functionallity

const text = document.getElementById("message");

document.addEventListener("keydown", function (e) {
  if (e.code == "Enter" && text.value != "") {
    console.log(text.value);
    socket.emit("chat-message", text.value);
    text.value = "";
  }
});

socket.on("createMessage", (message) => {
  const messageList = document.getElementById("message-list");
  messageList.append(createMessage(message));
  console.log("From server " + message);
});

function createMessage(message) {
  const li = document.createElement("li");
  li.innerHTML = `
  <b>User</b>
  <br>
  <p>${message}</p>`;
  return li;
}
