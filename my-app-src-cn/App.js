// src/App.js
import React from 'react';
import Scanner from './Scanner';

const App = () => {
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#F5F5F5',
    padding: '20px'
  };

  return (
    <div style={appStyle}>
      <p></p>
      <Scanner />
    </div>
  );
};

export default App;
