import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import socket from "../../socket";
import toast from "react-hot-toast";

const Chat = ({ display, roomId, openChat }) => {
  const currentUser = sessionStorage.getItem("user");
  const [msg, setMsg] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef();

  useEffect(() => {
    const receiveMessageHandler = ({ msg, sender }) => {
      setMsg((msgs) => [...msgs, { sender, msg }]);
      if (!display) {
        toast(
          <span onClick={() => openChat(true)} style={{ cursor: "pointer" }}>
            New Message from {sender}
          </span>
        );
      }
    };
    socket.on("FE-receive-message", receiveMessageHandler);
    return () => {
      socket.off("FE-receive-message", receiveMessageHandler);
    };
  }, [display]);

  // Scroll to Bottom of Message List
  useEffect(() => {
    scrollToBottom();
  }, [msg]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e) => {
    if (e.key === "Enter") {
      const msg = e.target.value;

      if (msg) {
        socket.emit("BE-send-message", { roomId, msg, sender: currentUser });
        inputRef.current.value = "";
      }
    }
  };

  return (
    <ChatContainer className={display ? "" : "width0"}>
      <TopHeader>Chat Room</TopHeader>
      <ChatArea>
        <MessageList>
          {msg &&
            msg.map(({ sender, msg }, idx) => {
              if (sender !== currentUser) {
                return (
                  <Message key={idx}>
                    <Name>{sender}</Name>
                    <p>{msg}</p>
                  </Message>
                );
              } else {
                return (
                  <UserMessage key={idx}>
                    <Name>You</Name>
                    <p>{msg}</p>
                  </UserMessage>
                );
              }
            })}
          <div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
        </MessageList>
      </ChatArea>
      <BottomInput
        ref={inputRef}
        onKeyUp={sendMessage}
        placeholder="Enter your message"
      />
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

const Name = styled.span`
  font-size: 13px;
  color: black;
`;

const TopHeader = styled.div`
  width: 100%;
  margin-top: 15px;
  font-weight: 600;
  font-size: 20px;
  color: black;
`;

const ChatArea = styled.div`
  width: 100%;
  height: 83%;
  max-height: 83%;
  overflow-x: hidden;
  overflow-y: auto;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const Message = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 16px;
  margin-top: 15px;
  text-align: left;

  > p {
    max-width: 65%;
    width: auto;
    padding: 7px;
    border-radius: 7px;
    font-size: 14px;
    background: darkcyan;
    color: white;
  }
`;

const UserMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  font-size: 16px;
  margin-top: 15px;
  text-align: right;

  > p {
    max-width: 65%;
    width: auto;
    padding: 7px;
    border-radius: 7px;
    background-color: #2196f3;
    color: white;
    font-size: 14px;
    text-align: left;
  }
`;

const BottomInput = styled.input`
  bottom: 0;
  width: 100%;
  height: 8%;
  padding: 15px;
  border-top: 1px solid rgb(69, 69, 82, 0.25);
  box-sizing: border-box;
  opacity: 0.7;

  :focus {
    outline: none;
  }
`;

export default Chat;
