import React from "react";
import styled from "styled-components";

const Chat = ({ display, users }) => {
  return (
    <ChatContainer className={display ? "" : "width0"}>
      <TopHeader>Users List</TopHeader>
      <Card>
        <Name>You</Name>
        <div style={{ display: "flex", gap: "10px" }}>
          <FaIcon
            className={
              users["localUser"].audio
                ? "fas fa-microphone"
                : "fas fa-microphone-slash"
            }
          />
          <FaIcon
            className={
              users["localUser"].video ? "fas fa-video" : "fas fa-video-slash"
            }
          />
        </div>
      </Card>
      {Object.entries(users).map(
        ([key, value]) =>
          key !== "localUser" && (
            <Card key={key}>
              <Name>{key}</Name>
              <div style={{ display: "flex", gap: "10px" }}>
                <FaIcon
                  className={
                    value.audio
                      ? "fas fa-microphone"
                      : "fas fa-microphone-slash"
                  }
                />
                <FaIcon
                  className={
                    value.video ? "fas fa-video" : "fas fa-video-slash"
                  }
                />
              </div>
            </Card>
          )
      )}
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;
  hieght: 100%;
  background-color: white;
  transition: all 0.5s ease;
  overflow: hidden;
`;
const FaIcon = styled.i`
  font-size: 16px;
`;
const TopHeader = styled.div`
  width: 100%;
  margin-top: 15px;
  font-weight: 600;
  font-size: 20px;
  color: black;
`;
const Card = styled.div`
  background-color: #6269e9;
  margin: 5px;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;
  align-items: center;
`;
const Name = styled.span`
  font-size: 16px;
`;
export default Chat;
