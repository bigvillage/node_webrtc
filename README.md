# node_webrtc
node_webrtc

Introduction

WebRTC란 ?
API를 사용하여 실시간 통신(RTC) 기능을 제공하는 오픈소스 프로젝트입니다.
동영상, 음성, 일반 데이터를 Peer 간에 실시간으로 전송되도록 지원해줍니다.


Description

webRTC를 사용하여 실시간 라이브스트리밍을 구축하였습니다.
방장의 방에 들어오는 시청자분들은 실시간으로 방장의 방송을 볼 수 있으며,
방장은 방송시작과 더불어 실시간으로 송출되는 방송을 녹화할 수 있도록 구현하였습니다.


Tech Stack

Vue.js(v3.3.4)
Node.js(v16.20.2)
Nginx(v1.18.0)

Library

socket.io-client(v4.7.2)
recordrtc(v5.6.2)
vue-web-cam(v1.9.0)

기본 로직 구성

![image](https://github.com/bigvillage/vue_webrtc/assets/86224836/35ee4091-98b9-4f5e-a8d0-1d420bfb47f7)
1) Alice는 Offer를 생성한다.
2) Alice는 생성한 Offer를 LocalDescription에 등록한다.
3) Alice는 생성한 Offer를 Bob에게 보낸다.
4) Bob은 받은 Offer를 RemoteDescription에 등록한다.
5) Bob은 Answer를 생성한다.
6) Bob은 생성한 Answer를 LocalDescrition에 등록한다.
7) Bob은 생성한 Answer를 Alice에게 보낸다.
8) Alice는 Bob에게 받은 Answer를 RemoteDescription에 등록한다.
9) Alice와 Bob은 시그널링 서버를 통해 각자의 ICE Candidates를 전송한다.
10) Alice와 Bob은 각자 수신받은 ICE Candidate을 addIceCandidate 함수를 호출하여 상대방의 ICE Candidate를 네트워크 정보에 추가한다.
11) 
* 조금 더 상세한 로직 구성은 pdf를 첨부하였으니 참고하시면 됩니다 *
