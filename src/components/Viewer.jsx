 // Viewer.js
 import React, { useState, useEffect, useRef } from 'react';
 import axios from 'axios';
 import { useParams } from 'react-router-dom';
 
 const Viewer = () => {
     const { uid } = useParams();
     const [peer, setPeer] = useState(null);
     const [isJoining, setIsJoining] = useState(false);
     const videoRef = useRef(null);
 
     useEffect(() => {
         if (isJoining) {
             init();
         }
     }, [isJoining]);
 
     const init = async () => {
         const peer = createPeer();
         peer.addTransceiver('video', { direction: 'recvonly' });
         setPeer(peer);
 
         try {
             const { data } = await axios.post('http://localhost:5000/join-stream', { uid });
             const desc = new RTCSessionDescription(data.sdp);
             peer.setRemoteDescription(desc);
         } catch (error) {
             console.error(error);
         }
     };
 
     const createPeer = () => {
         const peerConnection = new RTCPeerConnection({
             iceServers: [
                 {
                     urls: "stun:stun.stunprotocol.org"
                 }
             ]
         });
         peerConnection.ontrack = handleTrackEvent;
         peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);
 
         return peerConnection;
     };
 
     const handleNegotiationNeededEvent = async (peerConnection) => {
         const offer = await peerConnection.createOffer();
         await peerConnection.setLocalDescription(offer);
         const payload = {
             sdp: peerConnection.localDescription,
         };
 
         try {
             const { data } = await axios.post('http://localhost:5000/consumer', payload);
             const desc = new RTCSessionDescription(data.sdp);
             peerConnection.setRemoteDescription(desc).catch((e) => console.log(e));
         } catch (error) {
             console.error(error);
         }
     };
 
     const handleTrackEvent = (e) => {
         if (videoRef.current) {
             videoRef.current.srcObject = e.streams[0];
         }
     };
 
     return (
         <div>
             <button id="my-button" onClick={() => setIsJoining(true)}>
                 Join Stream
             </button>
             <video id="video" ref={videoRef} autoPlay />
         </div>
     );
 };
 
 export default Viewer;