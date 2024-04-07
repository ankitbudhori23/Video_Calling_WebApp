import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import styled from "styled-components";
import socket from "../../socket";
import VideoCard from "../Video/VideoCard";
import BottomBar from "../BottomBar/BottomBar";
import Chat from "../Chat/Chat";
import toast from "react-hot-toast";
import ShowAllUSer from "../Chat/ShowAllUser";
const Room = (props) => {
  const currentUser = sessionStorage.getItem("user");
  const [peers, setPeers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [displayUserList, setDisplayUserList] = useState(false);
  const [displayChat, setDisplayChat] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [userShareScreen, setUserShareScreen] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();
  const roomId = props.match.params.roomId;

  useEffect(() => {
    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
    });

    // Set Back Button Event
    window.addEventListener("popstate", goToBack);

    // Connect Camera & Mic
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;
        userStream.current = stream;
        socket.emit("BE-join-room", { roomId, userName: currentUser });
        socket.on("FE-user-join-msg", (username) => {
          toast(`${username} joined`, {
            icon: "👏",
            style: {
              borderRadius: "15px",
            },
          });
        });
        socket.on("FE-user-join", (users) => {
          // all users
          setAllUsers(users);
          const peers = [];
          users.forEach(({ userId, info }) => {
            let { userName, video, audio } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              peersRef.current.push({
                peerID: userId,
                peer,
                userName,
              });
              peers.push(peer);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { video, audio },
                };
              });
            }
          });

          setPeers(peers);
        });

        socket.on("FE-receive-call", ({ signal, from, info }) => {
          let { userName, video, audio } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.userName = userName;

            peersRef.current.push({
              peerID: from,
              peer,
              userName: userName,
            });
            setPeers((users) => {
              return [...users, peer];
            });
            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.userName]: { video, audio },
              };
            });
          }
        });

        socket.on("FE-call-accepted", ({ signal, answerId }) => {
          const peerIdx = findPeer(answerId);
          peerIdx.peer.signal(signal);
        });

        socket.on("FE-user-leave", ({ userId, userName }) => {
          const peerIdx = findPeer(userId);
          peerIdx.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(
            ({ peerID }) => peerID !== userId
          );
          setAllUsers((users) =>
            users.filter((user) => user.userId !== userId)
          );
          toast(`${userName} left`, {
            style: {
              background: "#333",
              borderRadius: "15px",
            },
          });
        });
      });

    socket.on("FE-toggle-camera", ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);
      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    socket.on("FE-share-screen", ({ username, isSharing }) => {
      setUserShareScreen(isSharing);
      if (isSharing) {
        toast(`${username} is sharing screen`, {
          style: {
            borderRadius: "15px",
          },
        });
      } else {
        toast("Screen sharing stopped", {
          style: {
            background: "#d34f4f",
            borderRadius: "15px",
          },
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-call-user", {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on("disconnect", () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-accept-call", { signal, to: callerId });
    });

    peer.on("disconnect", () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  const expandScreen = (e) => {
    const elem = e.target;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };
  function createUserVideo(peer, index, arr) {
    return (
      <VideoBox
        className={`width-peer${peers.length > 8 ? "" : peers.length};`}
        // onClick={userShareScreen ? expandScreen : null}
        key={index}
      >
        {userShareScreen && <FaIcon className="fas fa-expand" />}
        {writeUserName(peer.userName)}
        <VideoCard
          key={index}
          peer={peer}
          number={arr.length}
          mic={userVideoAudio[peer.userName]?.audio}
          video={userVideoAudio[peer.userName]?.video}
        />
      </VideoBox>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      if (!userVideoAudio[userName].video && !userShareScreen) {
        return <UserName key={userName}>{userName}</UserName>;
      }
    }
  }

  const clickChat = (e) => {
    e.stopPropagation();
    setDisplayChat(!displayChat);
  };

  const clickUsers = (e) => {
    e.stopPropagation();
    setDisplayUserList(!displayUserList);
  };

  // BackButton
  const goToBack = (e) => {
    e.preventDefault();
    socket.emit("BE-leave-room", { roomId, leaver: currentUser });
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const updatePeerConnections = (stream) => {
    peersRef.current.forEach(({ peer }) => {
      const senders = peer._pc.getSenders();
      senders.forEach((sender) => {
        if (sender.track.kind === "video") {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        } else if (sender.track.kind === "audio") {
          sender.replaceTrack(stream.getAudioTracks()[0]);
        }
      });
    });
  };
  const toggleCameraAudio = (e) => {
    const target = e.target.getAttribute("data-switch");
    if (target === "video") {
      if (userVideoAudio["localUser"].video === true) {
        userVideoRef.current.style.display = "none";
        userStream.current.getVideoTracks().forEach((track) => track.stop());
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            userVideoRef.current.style.display = "block";
            userVideoRef.current.srcObject = stream;
            userStream.current = stream;
            updatePeerConnections(stream);
          });
      }
    } else {
      const userStream = userVideoRef.current?.srcObject;
      if (userStream) {
        const audioTracks = userStream.getAudioTracks();
        if (audioTracks && audioTracks.length > 0) {
          audioTracks[0].enabled = !userVideoAudio["localUser"].audio;
        } else {
          alert("No audio track found");
        }
      } else {
        alert("User stream not available");
      }
    }

    setUserVideoAudio((preList) => {
      let videoSwitch = preList["localUser"].video;
      let audioSwitch = preList["localUser"].audio;

      if (target === "video") {
        if (videoSwitch === true) videoSwitch = false;
        else {
          videoSwitch = true;
          audioSwitch = true;
        }
      } else {
        audioSwitch = !audioSwitch;
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit("BE-toggle-camera-audio", { roomId, switchTarget: target });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            const senders = peer._pc.getSenders();

            senders.forEach((sender) => {
              if (sender.track.kind === "video") {
                sender.replaceTrack(screenTrack);
              }
            });
          });
          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
          socket.emit("BE-share-screen", {
            roomId,
            username: currentUser,
            isSharing: true,
          });
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              const senders = peer._pc.getSenders();
              senders.forEach((sender) => {
                if (sender.track.kind === "video") {
                  sender.replaceTrack(userStream.current.getVideoTracks()[0]);
                }
              });
            });
            userVideoRef.current.srcObject = userStream.current;
            socket.emit("BE-share-screen", {
              roomId,
              currentUser,
              isSharing: false,
            });
            setScreenShare(false);
          };
        })
        .catch((error) => {
          console.error("Error accessing screen sharing:", error);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = (event) => {
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.value
    ) {
      const deviceId = event.target.dataset.value;
      const enabledAudio =
        userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: enabledAudio })
        .then((stream) => {
          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");
          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");

          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);

          peersRef.current.forEach(({ peer }) => {
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current
            );
          });
        });
    }
  };

  return (
    <RoomContainer onClick={clickBackground}>
      <VideoAndBarContainer>
        <VideoContainer>
          <MyVideo ref={userVideoRef} muted autoPlay playInline></MyVideo>
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
        </VideoContainer>
        <BottomBar
          clickScreenSharing={clickScreenSharing}
          clickChat={clickChat}
          clickCameraDevice={clickCameraDevice}
          goToBack={goToBack}
          toggleCameraAudio={toggleCameraAudio}
          userVideoAudio={userVideoAudio["localUser"]}
          screenShare={screenShare}
          videoDevices={videoDevices}
          showVideoDevices={showVideoDevices}
          setShowVideoDevices={setShowVideoDevices}
          showUserList={clickUsers}
          usersCount={allUsers.length}
        />
      </VideoAndBarContainer>
      <Chat display={displayChat} openChat={setDisplayChat} roomId={roomId} />
      <ShowAllUSer display={displayUserList} users={allUsers} />
    </RoomContainer>
  );
};

const RoomContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  flex-direction: row;
`;

const VideoContainer = styled.div`
  max-width: 100%;
  height: 92%;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  gap: 10px;
`;
const VideoAndBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const MyVideo = styled.video`
  width: 250px;
  position: absolute;
  bottom: 0;
  right: 0;
`;
const VideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const UserName = styled.div`
  position: absolute;
  z-index: 1;
  background: #673ab7;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FaIcon = styled.i`
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 1;
`;

export default Room;
