import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase'; // Import your Firestore configuration
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const Creator = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
    const yourVideoRef = useRef(null);
    const yourAudioRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [user, setUser] = useState(null);
    const [streamTitle, setStreamTitle] = useState('');
    const [streamUsername, setStreamUsername] = useState('');
    const [isTitleUsernameSet, setIsTitleUsernameSet] = useState(false);

    const { uid } = useParams(); // Get the UID parameter from the URL
    const streamLink = `${window.location.origin}/viewer/${uid}`; // Generate the stream link

    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isStreaming) {
            startStream();
        } else {
            stopStream();
        }
    }, [isStreaming]);

    async function startStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicrophoneOn });
            setIsStreaming(true);

            if (yourVideoRef.current) {
                yourVideoRef.current.srcObject = stream;
            }
            if (yourAudioRef.current) {
                yourAudioRef.current.srcObject = stream;
            }

            const peerConnection = createPeer();
            peerConnectionRef.current = peerConnection;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            // Send an offer to the signaling server and pass the stream link
            handleNegotiationNeededEvent(peerConnection, streamLink);
            
            // Save the UID of the stream creator in Firestore
            saveStreamCreator(uid, streamTitle, streamUsername);

            // Show a success message
            alert('Stream saved successfully.');
        } catch (error) {
            console.error('Error accessing camera and microphone:', error);
        }
    }

    function stopStream() {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        setIsStreaming(false);
    }

    function createPeer() {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);

        return peerConnection;
    }

    function handleNegotiationNeededEvent(peerConnection, link) {
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                const payload = {
                    sdp: peerConnection.localDescription,
                    link, // Pass the stream link
                };

                axios.post('http://localhost:5000/broadcast', payload)
                    .then(response => {
                        const desc = new RTCSessionDescription(response.data.sdp);
                        return peerConnection.setRemoteDescription(desc);
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
    }

    function toggleMicrophone() {
        setIsMicrophoneOn(!isMicrophoneOn);
        if (yourAudioRef.current && yourAudioRef.current.srcObject) {
            const audioTracks = yourAudioRef.current.srcObject.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMicrophoneOn;
            });
        }
    }

    // Function to save the UID, title, and username of the stream creator in Firestore
    const saveStreamCreator = async (streamUid, title, username) => {
        if (title && username) {
            const streamData = {
                creatorUid: streamUid,
                title,
                username,
                createdAt: new Date(),
            };

            try {
                await addDoc(collection(db, 'livestreams'), streamData);
                setIsTitleUsernameSet(true); // Mark title and username as set
            } catch (error) {
                console.error('Error saving stream creator data:', error);
            }
        }
    };

    // Add this function to navigate to the Viewer component
    function navigateToViewer() {
        navigate(`/viewer/${uid}`);
    }

    return (
        <div>
            {user ? (
                <div>
                    <p>User Email: {user.email}</p>
                    <p>
                        Stream Link: <a href={streamLink}>{streamLink}</a>
                    </p>
                </div>
            ) : (
                <p>Please log in to view user information.</p>
            )}
            {isTitleUsernameSet ? (
                <div>
                    <p>Stream Title: {streamTitle}</p>
                    <p>Username: {streamUsername}</p>
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Stream Title"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        disabled={isTitleUsernameSet}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={streamUsername}
                        onChange={(e) => setStreamUsername(e.target.value)}
                        disabled={isTitleUsernameSet}
                    />
                </div>
            )}
            <button onClick={() => setIsStreaming(!isStreaming)} className="btn">
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </button>
            <button onClick={toggleMicrophone} className="btn">
                {isMicrophoneOn ? 'Mute Microphone' : 'Unmute Microphone'}
            </button>
            {/* Add a button to navigate to the Viewer component */}
            <button onClick={navigateToViewer} className="btn">
                Go to Viewer
            </button>
            {isStreaming && <video ref={yourVideoRef} autoPlay playsInline></video>}
            {isStreaming && <audio ref={yourAudioRef} autoPlay></audio>}
        </div>
    );
};

export default Creator;
