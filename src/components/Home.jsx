// Home.js
import React, { useEffect, useState } from 'react';
import { Card, Button } from 'antd';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [streaming, setStreaming] = useState(false);

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

  return (
    <div className="home-container">
      <Card title="Welcome to the Home Page" style={{ width: 300 }}>
        {user ? (
          <div>
            <p>User Email: {user.email}</p>
            <p>User UID: {user.uid}</p>
          </div>
        ) : ( 
          <p>Please log in to view user information.</p>
        )}
        <Link to={`/creator/${user?.uid}`}>
          <Button type="primary" disabled={streaming}>
            Create Stream
          </Button>
        </Link>
        <Link to={`/viewer/${user?.uid}`}>
          <Button type="primary">
            Join Stream
          </Button>
        </Link>
      </Card>
    </div> 
  );
};

export default Home