const express = require("express");
const https = require("https");
const http = require("http");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
const socketIo = require("socket.io");
const fs = require("fs");
const wrtc = require("wrtc");
const stun = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
};

const server = https.createServer(
  {
    key: fs.readFileSync("./pem/STAR.jaehwan.co.kr_key.pem"),
    cert: fs.readFileSync("./pem/STAR.jaehwan.co.kr_crt.pem"),
  },
  app
);
const io = socketIo(server);

const rooms = {};

/**
 *
 * @param {import("socket.io").Socket} socket
 */
const onConnectionHandler = (socket) => {
  console.log("Connected");
  socket.on("joinRoom", (currentId, roomName) => {
    console.log("join room", roomName);
    // 소켓을 해당 방에 조인합니다.
    socket.join(roomName);
    // 만약 해당 방이 rooms 객체에 존재하지 않는다면, 새로운 방을 생성합니다.
    if (!rooms[roomName]) {
      rooms[roomName] = {
        users: {},
      };
    }
    // 해당 방에 현재 사용자를 추가합니다.
    rooms[roomName].users[currentId] = {};
    // 현재 사용자에게 "joined_room" 이벤트를 보내 방 참여를 알립니다.
    const users = Object.keys(rooms[roomName].users);
    const isMasterValue = users.length == 1 && users[0] == socket.id;
    io.to(currentId).emit("joined_room", isMasterValue);
    io.to(roomName).emit("users", users);
  });

  socket.on("senderOffer", async (offer, roomName) => {
    console.log("2. get senderOffer");
    // RTCPeerConnection을 생성하고 해당 방의 사용자 정보에 저장합니다.
    const pc = new wrtc.RTCPeerConnection(stun);
    rooms[roomName].users[socket.id] = {
      pc,
    };
    // RTCPeerConnection의 "onicecandidate" 이벤트를 처리하여 후보(ICE Candidate) 정보를 응답합니다.
    rooms[roomName].users[socket.id].pc.onAir = true;

    rooms[roomName].users[socket.id].pc.onicecandidate = (e) => {
      if (e.candidate) {
        io.to(socket.id).emit("sendercandidateanswer", e.candidate);
      }
    };
    // RTCPeerConnection의 "ontrack" 이벤트를 처리하여 수신한 스트림을 처리합니다.
    rooms[roomName].users[socket.id].pc.ontrack = async (e) => {
      if (rooms[roomName].users[socket.id].stream) return;
      // 수신한 스트림 정보를 저장하고, 모든 사용자에게 "enterUser" 이벤트를 보내 새로운 사용자를 알립니다.
      rooms[roomName].users[socket.id].stream = e.streams[0];
      socket.to(roomName).emit("enterUser", socket.id);
    };
    // 수신한 Offer 정보를 설정합니다.
    await rooms[roomName].users[socket.id].pc.setRemoteDescription(offer);
    // Answer를 생성합니다.
    const answer = await rooms[roomName].users[socket.id].pc.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    // 로컬 Answer를 설정합니다.
    await rooms[roomName].users[socket.id].pc.setLocalDescription(answer);
    // 모든 사용자에 대한 정보를 포함한 Answer를 전송합니다.
    const allUsers = Object.keys(rooms[roomName].users).reduce(
      (usersObj, currentUserId) => {
        if (currentUserId != socket.id) {
          usersObj[currentUserId] = rooms[roomName].users[currentUserId];
        }
        return usersObj;
      },
      {}
    );
    console.log("3. send answer of senderOffer");
    io.to(socket.id).emit("senderAnswer", answer, allUsers);
  });

  socket.on("senderCandidate", async (candidate, roomName) => {
    if (candidate) {
      await rooms[roomName].users[socket.id].pc.addIceCandidate(
        new wrtc.RTCIceCandidate(candidate)
      );
    }
  });

  socket.on("receiverOffer", async (offer, receiverId, senderId, roomName) => {
    try {
      if (!rooms[roomName].users[senderId].receiverPcs) {
        rooms[roomName].users[senderId].receiverPcs = {};
      }
      const receiverPcs = rooms[roomName].users[senderId].receiverPcs;
      receiverPcs[receiverId] = new wrtc.RTCPeerConnection(stun);
      receiverPcs[receiverId].onicecandidate = (e) => {
        if (e.candidate) {
          io.to(senderId).emit("getReceiverCandidate", receiverId, e.candidate);
        }
      };
      if (rooms[roomName].users[receiverId].stream) {
        rooms[roomName].users[receiverId].stream
          .getTracks()
          .forEach((track) => {
            receiverPcs[receiverId].addTrack(
              track,
              rooms[roomName].users[receiverId].stream
            );
          });
      }

      await receiverPcs[receiverId].setRemoteDescription(offer);
      const answer = await receiverPcs[receiverId].createAnswer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await receiverPcs[receiverId].setLocalDescription(answer);
      io.to(senderId).emit("getReceiverAnswer", answer, receiverId);
    } catch (error) {
      console.log(error.message);
    }
  });
  socket.on(
    "receiverCandidate",
    async (candidate, receiverId, senderId, roomName) => {
      rooms[roomName].users[receiverId].receiverPcs[senderId].addIceCandidate(
        new wrtc.RTCIceCandidate(candidate)
      );
    }
  );

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
  socket.on("disconnect", (reason) => {
    console.log(111);
    console.log("reason", reason);
    for (const { users } of Object.values(rooms)) {
      if (users[socket.id]) {
        delete users[socket.id];
        console.log("delete userinfo");
      }
    }
  });
};
io.on("connection", onConnectionHandler);
server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
