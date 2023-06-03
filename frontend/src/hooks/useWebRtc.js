import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStateWithCallback } from "./useStateWithCallback";
import socketInit from "../socket";
import { ACTIONS } from "../actions";
import freeice from "freeice";

export const useWebRtc = (roomId, user) => {
  const [clients, setClients] = useStateWithCallback([]);
  const audioElements = useRef({}); //{userId:instance} List of users id for getting their individual audio   {userId:instance} in this form
  const connections = useRef({}); //{socketId : webRTC_Connection}
  const localMediaStream = useRef(null); //For getting local media data

  const socket = useRef(null);
  const clientsRef = useRef(null);

  // useEffect(() => {
  //   socket.current = socketInit();
  // }, []);

  const addNewClient = useCallback(
    (newClient, cb) => {
      const lookingFor = clients.find((client) => client.id === newClient.id);

      if (lookingFor === undefined) {
        setClients((existingClients) => [...existingClients, newClient], cb);
      }
    },
    [clients, setClients]
  );

  useEffect(() => {
    console.log("render clientsRef.current = clients", 3);
    clientsRef.current = clients;
  }, [clients]);

  //------------------------s-------------------------------
  useEffect(() => {
    const initChat = async () => {
      socket.current = socketInit();
      await captureMedia();
      addNewClient({ ...user, muted: true }, () => {
        const localElement = audioElements.current[user.id];
        if (localElement) {
          localElement.volume = 0;
          localElement.srcObject = localMediaStream.current;
        }
      });
      socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
        handleSetMute(isMute, userId);
      });

      socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
      socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
      socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
      socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
      socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
        handleSetMute(true, userId);
      });
      socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
        handleSetMute(false, userId);
      });
      socket.current.emit(ACTIONS.JOIN, {
        roomId,
        user,
      });

      async function captureMedia() {
        // Start capturing local audio stream.
        localMediaStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }
      async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
        if (peerId in connections.current) {
          return console.warn(
            `You are already connected with ${peerId} (${user.name})`
          );
        }

        // Store it to connections
        connections.current[peerId] = new RTCPeerConnection({
          iceServers: freeice(),
        });

        // Handle new ice candidate on this peer connection
        connections.current[peerId].onicecandidate = (event) => {
          socket.current.emit(ACTIONS.RELAY_ICE, {
            peerId,
            icecandidate: event.candidate,
          });
        };

        // Handle on track event on this connection
        connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
          addNewClient({ ...remoteUser, muted: true }, () => {
            // get current users mute info
            const currentUser = clientsRef.current.find(
              (client) => client.id === user.id
            );
            if (currentUser) {
              socket.current.emit(ACTIONS.MUTE_INFO, {
                userId: user.id,
                roomId,
                isMute: currentUser.muted,
              });
            }
            if (audioElements.current[remoteUser.id]) {
              audioElements.current[remoteUser.id].srcObject = remoteStream;
            } else {
              let settled = false;
              const interval = setInterval(() => {
                if (audioElements.current[remoteUser.id]) {
                  audioElements.current[remoteUser.id].srcObject = remoteStream;
                  settled = true;
                }

                if (settled) {
                  clearInterval(interval);
                }
              }, 300);
            }
          });
        };

        // Add connection to peer connections track
        localMediaStream.current.getTracks().forEach((track) => {
          connections.current[peerId].addTrack(track, localMediaStream.current);
        });

        // Create an offer if required
        if (createOffer) {
          const offer = await connections.current[peerId].createOffer();

          // Set as local description
          await connections.current[peerId].setLocalDescription(offer);

          // send offer to the server
          socket.current.emit(ACTIONS.RELAY_SDP, {
            peerId,
            sessionDescription: offer,
          });
        }
      }
      async function handleRemovePeer({ peerId, userId }) {
        // Correction: peerID to peerId
        if (connections.current[peerId]) {
          connections.current[peerId].close();
        }

        delete connections.current[peerId];
        delete audioElements.current[peerId];
        setClients((list) => list.filter((c) => c.id !== userId));
      }
      async function handleIceCandidate({ peerId, icecandidate }) {
        if (icecandidate) {
          connections.current[peerId].addIceCandidate(icecandidate);
        }
      }
      async function setRemoteMedia({
        peerId,
        sessionDescription: remoteSessionDescription,
      }) {
        connections.current[peerId].setRemoteDescription(
          new RTCSessionDescription(remoteSessionDescription)
        );

        // If session descrition is offer then create an answer
        if (remoteSessionDescription.type === "offer") {
          const connection = connections.current[peerId];

          const answer = await connection.createAnswer();
          connection.setLocalDescription(answer);

          socket.current.emit(ACTIONS.RELAY_SDP, {
            peerId,
            sessionDescription: answer,
          });
        }
      }
      async function handleSetMute(mute, userId) {
        const clientIdx = clientsRef.current
          .map((client) => client.id)
          .indexOf(userId);
        const allConnectedClients = JSON.parse(
          JSON.stringify(clientsRef.current)
        );
        if (clientIdx > -1) {
          allConnectedClients[clientIdx].muted = mute;
          setClients(allConnectedClients);
        }
      }
    };

    initChat();
    return () => {
      localMediaStream.current.getTracks().forEach((track) => track.stop());
      socket.current.emit(ACTIONS.LEAVE, { roomId });
      for (let peerId in connections.current) {
        connections.current[peerId].close();
        delete connections.current[peerId];
        delete audioElements.current[peerId];
      }
      socket.current.off(ACTIONS.ADD_PEER);
      socket.current.off(ACTIONS.REMOVE_PEER);
      socket.current.off(ACTIONS.ICE_CANDIDATE);
      socket.current.off(ACTIONS.SESSION_DESCRIPTION);
      socket.current.off(ACTIONS.MUTE);
      socket.current.off(ACTIONS.UNMUTE);
    };
  }, []);

  //------------------------e------------------------------

  // //3
  // const addNewClient = useCallback(
  //   (newClient, cb) => {
  //     const lookingFor = clients.find((client) => client.id === newClient.id);
  //     if (lookingFor === undefined) {
  //       setClients((existingClients) => [...existingClients, newClient], cb);
  //     }
  //   },
  //   [clients, setClients]
  // );

  // //capture Media
  // useEffect(() => {
  //   //1
  //   const startCapture = async () => {
  //     localMediaStream.current = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //     });
  //   };

  //   //2
  //   startCapture().then(() => {
  //     addNewClient({ ...user, muted: true }, () => {
  //       const localElement = audioElements.current[user.id];
  //       if (localElement) {
  //         localElement.volume = 0;
  //         localElement.srcObject = localMediaStream.current;
  //       }

  //       //Emit JOIN from socketIo
  //       socket.current.emit(ACTIONS.JOIN, { roomId, user });
  //     });
  //   });

  //   return () => {
  //     //leaving the room
  //     console.log("Leaving.....1");
  //     localMediaStream.current.getTracks().forEach((track) => track.stop());
  //     socket.current.emit(ACTIONS.LEAVE, { roomId });
  //   };
  // }, []);

  // useEffect(() => {
  //   const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
  //     //PeerId is my socketId
  //     //check in connections if peerId there or not
  //     if (peerId in connections.current) {
  //       //connections= {socketId : webRTC_Connection}
  //       return console.warn(
  //         `You are already connected with ${peerId} (${user.name})`
  //       );
  //     }

  //     connections.current[peerId] = new RTCPeerConnection({
  //       //If not then create the webRtc Connection
  //       iceServers: freeice(),
  //     });

  //     /*
  //               var peerConn  = new RTCPeerConnection(cofiguration);
  //               peerConn.ontrack = gotStream;
  //               peerConn.onicecandidate = gotIceCandidate;
  //               peerConn.addStream(localStream);
  //     */

  //     //Handle on IceCandidate ---------that we did in the browser as....peerConnection.onIceCandidate=()=>{} ------------------------
  //     connections.current[peerId].onicecandidate = (event) => {
  //       socket.current.emit(ACTIONS.RELAY_ICE, {
  //         peerId,
  //         icecandidate: event.candidate,
  //       });
  //     };

  //     //-----------------------------------------------------------------------------------------------------------------------------
  //     //Handle the on Track on this connection
  //     connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
  //       //OnTrack we will ad our client to the list
  //       addNewClient({ ...remoteUser, muted: true }, () => {
  //         //we will assign the remoteStream to its src object of the audio element
  //         if (audioElements.current[remoteUser.id]) {
  //           audioElements.current[remoteUser.id].srcObject = remoteStream;
  //         } else {
  //           //till rendering is in progress keep checking untill srd is assigned
  //           let settled = false;
  //           const interval = setInterval(() => {
  //             if (audioElements.current[remoteUser.id]) {
  //               audioElements.current[remoteUser.id].srcObject = remoteStream;
  //               settled = true;
  //             }
  //             if (settled) {
  //               clearInterval(interval);
  //             }
  //           }, 1000);
  //         }
  //       });
  //     };

  //     //add local track(audio or vedio...our case only audio) to remote connection.....so that my voice will be listened by remote clients in the room
  //     localMediaStream.current.getTracks().forEach((track) => {
  //       //The RTCPeerConnection method addTrack() adds a new media track to the set of tracks which will be transmitted to the other peer.
  //       //addTrack(track, stream0, stream1, /* … ,*/ streamN)
  //       connections.current[peerId].addTrack(track, localMediaStream.current); //It expects these two parameters
  //     });

  //     //--------------------------------------------------------------------------------------------------------------
  //     //create offer
  //     if (createOffer) {
  //       const offer = await connections.current[peerId].createOffer();

  //       await connections.current[peerId].setLocalDescription(offer);

  //       //send this offer to another client
  //       socket.current.emit(ACTIONS.RELAY_SDP, {
  //         peerId,
  //         sessionDescription: offer,
  //       });
  //     }
  //   };
  //   socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
  //   return () => {
  //     socket.current.off(ACTIONS.ADD_PEER);
  //   };
  // }, []);

  // //handle ice candidate
  // useEffect(() => {
  //   socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
  //     if (icecandidate) {
  //       connections.current[peerId].addIceCandidate(icecandidate);
  //     }
  //   });
  //   return () => {
  //     socket.current.off(ACTIONS.ICE_CANDIDATE);
  //   };
  // }, []);

  // //handle remote sdp
  // useEffect(() => {
  //   const handleRemoteSdp = async ({
  //     peerId,
  //     sessionDescription: remoteSessionDescription,
  //   }) => {
  //     connections.current[peerId].setRemoteDescription(
  //       new RTCSessionDescription(remoteSessionDescription)
  //     );

  //     // If session descrition is offer then create an answer
  //     if (remoteSessionDescription.type === "offer") {
  //       const connection = connections.current[peerId];

  //       const answer = await connection.createAnswer();
  //       connection.setLocalDescription(answer);

  //       socket.current.emit(ACTIONS.RELAY_SDP, {
  //         peerId,
  //         sessionDescription: answer,
  //       });
  //     }
  //     // connections.current[peerId].setRemoteDescription(
  //     //   new RTCSessionDescription(remoteSessionDescription)
  //     // );
  //     // //check is sdp is of type offerthen create an answer
  //     // if (remoteSessionDescription.type === "offer") {
  //     //   const connection = connections.current[peerId];
  //     //   const answer = await connection.createAnswer();
  //     //   connection.setLocalDescription(answer);

  //     //   socket.current.emit(ACTIONS.RELAY_SDP, {
  //     //     peerId,
  //     //     sessionDescription: answer,
  //     //   });
  //     // }
  //   };

  //   socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSdp);
  //   return () => {
  //     socket.current.off(ACTIONS.SESSION_DESCRIPTION);
  //   };
  // }, []);

  // //Handle remove peer
  // useEffect(() => {
  //   // const handleRemovePeer = async ({ peerId, userId }) => {
  //   //   console.log("My UserId", userId);
  //   //   if (connections.current[peerId]) {
  //   //     connections.current[peerId].close();
  //   //   }
  //   //   delete connections.current[peerId];
  //   //   delete audioElements.current[peerId];
  //   //   console.log("Here i reached inside---handle remove peer");
  //   //   setClients((list) => {
  //   //     console.log("clients list", userId, list);
  //   //     return list.filter((c) => c.id !== userId);
  //   //   });
  //   // };
  //   const handleRemovePeer = ({ peerId, userId }) => {
  //     console.log("render inside handle remove peer out", 13);
  //     // Correction: peerID to peerId
  //     if (connections.current[peerId]) {
  //       connections.current[peerId].close();
  //     }

  //     delete connections.current[peerId];
  //     delete audioElements.current[peerId];
  //     setClients((list) => list.filter((c) => c.id !== userId));
  //   };
  //   socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
  //   return () => {
  //     for (let peerId in connections.current) {
  //       connections.current[peerId].close();
  //       delete connections.current[peerId];
  //       delete audioElements.current[peerId];
  //       console.log("removing", connections.current);
  //     }
  //     socket.current.off(ACTIONS.REMOVE_PEER);
  //   };
  // }, []);

  // useEffect(() => {
  //   // handle mute and unmute
  //   console.log("render inside mute useEffect", 14);
  //   socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
  //     setMute(true, userId);
  //   });

  //   socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
  //     setMute(false, userId);
  //   });

  //   const setMute = (mute, userId) => {
  //     // console.log("ref", clientsRef.current);
  //     const clientIdx = clientsRef.current
  //       .map((client) => client.id)
  //       .indexOf(userId);
  //     const allConnectedClients = JSON.parse(
  //       JSON.stringify(clientsRef.current)
  //     );
  //     if (clientIdx > -1) {
  //       allConnectedClients[clientIdx].muted = mute;
  //       setClients(allConnectedClients);
  //     }
  //   };
  // }, []);

  //---------------------------------------------------------------------------------------------------------------

  //Adding audioelements in object
  const provideRef = (instance, userId) => {
    audioElements.current[userId] = instance;
  };

  const handleMute = (isMute, userId) => {
    let settled = false;

    if (userId === user.id) {
      let interval = setInterval(() => {
        if (localMediaStream.current) {
          localMediaStream.current.getTracks()[0].enabled = !isMute;
          if (isMute) {
            socket.current.emit(ACTIONS.MUTE, {
              roomId,
              userId: user.id,
            });
          } else {
            socket.current.emit(ACTIONS.UNMUTE, {
              roomId,
              userId: user.id,
            });
          }
          settled = true;
        }
        if (settled) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  return { clients, provideRef, handleMute };
};
