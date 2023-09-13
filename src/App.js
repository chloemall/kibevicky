import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Viewer from './components/Viewer';
import Creator from './components/Creator';
import Login from './components/Login';
import Home from './components/Home';
import Chat from './components/Chat';
import ViewerLogin from './components/ViewerLogin';

const App = () => {
    return (
            <div>
                <Routes>
                <Route path="/viewer/:uid" element={<Viewer />} />
                <Route path='/' element={<Login/>} />
                <Route path='/home' element={<Home/>} />
                <Route path="/creator/:uid" element={<Creator />} /> {/* Define a route with a UID parameter */}
                <Route path='/chat' element={<Chat/>} />
                <Route path='/viewerlogin' element={<ViewerLogin/>} />
                
                </Routes>
            </div>
    );
}

export default App;

