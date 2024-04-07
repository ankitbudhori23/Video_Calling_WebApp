import React, { useEffect, useRef } from "react";
import styled from "styled-components";
const VideoCard = (props) => {
  const ref = useRef();
  const { peer, mic, video } = props;

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on("track", (track, stream) => {});
  }, [peer]);

  return (
    <UserVid>
      <Video playsInline autoPlay ref={ref} />
      <Toggle>
        {mic ? (
          <FaIcon className="fas fa-microphone"></FaIcon>
        ) : (
          <FaIcon
            style={{ right: "15px" }}
            className="fas fa-microphone-slash"
          ></FaIcon>
        )}
        {video ? (
          <FaIcon className="fas fa-video"></FaIcon>
        ) : (
          <FaIcon
            style={{ left: "15px" }}
            className="fas fa-video-slash"
          ></FaIcon>
        )}
      </Toggle>
    </UserVid>
  );
};

const Video = styled.video`
  width: 100%;
  height: 100%;
`;

const Toggle = styled.div`
  position: absolute;
  bottom: 10px;
  right: 0;
  z-index: 5;
`;
const UserVid = styled.div`
  position: relative;
`;
const FaIcon = styled.i`
  font-size: 15px;
  margin-right: 10px;
`;
export default VideoCard;
