// ViewerLogin.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './Login.css';

const ViewerLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async () => {
    try {
      setError(null);
      setSuccessMessage('');

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Login successful!');
        navigate('/viewer'); // Redirect to the Viewer component after login
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Sign-up successful!');
        navigate('/viewer'); // Redirect to the Viewer component after signup
      }
    } catch (error) {
      setError(error.message);
      console.error('Error:', error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="center">
        <h2>{isLogin ? 'Viewer Login' : 'Viewer Sign Up'}</h2>
        <form>
          <div className="input-container">
            <label>Email:</label>
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <label>Password:</label>
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="auth-button" type="button" onClick={handleAuth}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Create an account' : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  );
};

export default ViewerLogin;
