import React, { useCallback } from "react";
import styled from "styled-components";

const BottomBar = ({
  clickChat,
  clickCameraDevice,
  goToBack,
  toggleCameraAudio,
  userVideoAudio,
  clickScreenSharing,
  screenShare,
  videoDevices,
  showVideoDevices,
  setShowVideoDevices,
  showUserList,
  usersCount,
}) => {
  const handleToggle = useCallback(
    (e) => {
      setShowVideoDevices((state) => !state);
    },
    [setShowVideoDevices]
  );

  return (
    <Bar>
      <Center>
        <div style={{ position: "relative" }}>
          <CameraButton onClick={toggleCameraAudio} data-switch="video">
            <div>
              {userVideoAudio.video ? (
                <FaIcon className="fas fa-video"></FaIcon>
              ) : (
                <FaIcon className="fas fa-video-slash"></FaIcon>
              )}
            </div>
            Camera
            {showVideoDevices && (
              <SwitchList>
                {videoDevices.length > 0 &&
                  videoDevices.map((device) => {
                    return (
                      <div
                        key={device.deviceId}
                        onClick={clickCameraDevice}
                        data-value={device.deviceId}
                      >
                        {device.label}
                      </div>
                    );
                  })}
                <div>Switch Camera</div>
              </SwitchList>
            )}
          </CameraButton>
          <SwitchMenu onClick={handleToggle}>
            <i className="fas fa-angle-up"></i>
          </SwitchMenu>
        </div>
        <CameraButton onClick={toggleCameraAudio} data-switch="audio">
          <div>
            {userVideoAudio.audio ? (
              <FaIcon className="fas fa-microphone"></FaIcon>
            ) : (
              <FaIcon className="fas fa-microphone-slash"></FaIcon>
            )}
          </div>
          Audio
        </CameraButton>
        <ScreenButton onClick={clickScreenSharing}>
          <div>
            <FaIcon
              className={`fas fa-desktop ${screenShare ? "sharing" : ""}`}
            ></FaIcon>
          </div>
          {screenShare ? "Stop Share" : "Share Screen"}
        </ScreenButton>
        <ChatButton onClick={clickChat}>
          <div>
            <FaIcon className="fas fa-comments"></FaIcon>
          </div>
          Chat
        </ChatButton>
        <ChatButton onClick={showUserList}>
          <Barge>{usersCount}</Barge>
          <div>
            <FaIcon className="fas fa-users"></FaIcon>
          </div>
          Participants
        </ChatButton>
      </Center>
      <Right>
        <StopButton onClick={goToBack}>End Call</StopButton>
      </Right>
    </Bar>
  );
};

const Bar = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  background-color: #008b8b;
  z-index: 100;
`;

const Barge = styled.span`
  background: #673ab7;
  border-radius: 50px;
  position: absolute;
  right: 0px;
  top: -2px;
  padding: 5px;
  font-size: 12px;
`;
const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Right = styled.div``;

const ChatButton = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;
  position: relative;
  :hover {
    background-color: #12aaaa;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const ScreenButton = styled.div`
  width: auto;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #12aaaa;
    cursor: pointer;
    border-radius: 15px;
  }

  .sharing {
    color: #ee2560;
  }
`;

const FaIcon = styled.i`
  width: 30px;
  font-size: calc(16px + 1vmin);
`;

const StopButton = styled.div`
  width: 75px;
  height: 30px;
  border: none;
  font-size: 0.9375rem;
  line-height: 30px;
  margin-right: 15px;
  background-color: #ee2560;
  border-radius: 15px;

  :hover {
    background-color: #f25483;
    cursor: pointer;
  }
`;

const CameraButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #12aaaa;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  .fa-microphone-slash {
    color: #ee2560;
  }

  .fa-video-slash {
    color: #ee2560;
  }
`;

const SwitchMenu = styled.div`
  display: flex;
  position: absolute;
  width: 20px;
  top: 0;
  right: 0;
  z-index: 1;

  :hover {
    background-color: #12aaaa;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  > i {
    width: 90%;
    font-size: calc(10px + 1vmin);
  }
`;

const SwitchList = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -65.95px;
  background-color: #008b8b;
  color: white;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
  text-align: left;

  > div {
    font-size: 0.85rem;
    padding: 1px;
    margin-bottom: 5px;

    :not(:last-child):hover {
      background-color: 008b8b;
      cursor: pointer;
    }
  }

  > div:last-child {
    border-top: 1px solid white;
    cursor: context-menu !important;
  }
`;

export default BottomBar;
