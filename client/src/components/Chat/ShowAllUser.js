import React from "react";
import styled from "styled-components";

const Chat = ({ display, users }) => {
  const currentUser = sessionStorage.getItem("user");
  return (
    <ChatContainer className={display ? "" : "width0"}>
      <TopHeader>Users List</TopHeader>
      <Card>You</Card>
      {users.map(
        (user) =>
          user.info.userName !== currentUser && (
            <Card key={user.userId}>{user.info.userName}</Card>
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
  padding: 10px;
  border-radius: 10px;
  font-size: 18px;
  text-align: left;
`;
export default Chat;
