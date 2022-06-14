const videoGrid = document.querySelector(".video-grid");
const socket = io("/");

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

const peers = {};
//user who started the call is not in this array but should be
//will implement later

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((localStream) => {
      const video = document.createElement("video");
      video.classList.add("local");
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
  if (peers[userId]) peers[userId].close();
});

function connectNewUser(userId, localStream) {
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
  console.log("calledCreateMessage");
  li.innerHTML = `
  <p class = "text-gray-400 my-2 text-lg">User</p>
  <span class = "rounded-2xl inline-block w-auto bg-violet-400 text-white font-semibold text-xl px-4
  py-2">${message}</span>`;
  return li;
}

// function toggleVideo() {
//   navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
//     const video = document.querySelector(".local");
//     video.srcObject = stream;
//     video.play();
//   }
// }
// function toggleMute() {
//   const video = document.querySelector("video.local");
//   console.log(video);
//   const mic = document.querySelector("#mic");
//   mic.classList.toggle("text-red-700");
//   console.log(mic);
//   // console.log("video muted");
//   video.muted = !video.muted;
// }
