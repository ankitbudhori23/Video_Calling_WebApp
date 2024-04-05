import io from "socket.io-client";
const sockets = io("https://mkwp9t-3000.csb.app", {
  autoConnect: true,
  forceNew: true,
});
// const sockets = io('/');
export default sockets;
