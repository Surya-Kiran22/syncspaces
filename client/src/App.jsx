import React from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Header } from './components/Header';
import { JoinRoomModal } from './components/JoinRoomModal';
import { SplitLayout } from './components/SplitLayout';

const MainContent = () => {
  const { currentRoom, notification } = useSocket();

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          color: '#f8fafc',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }} className="animate-fade-in">
          <span className="pulse-dot" />
          {notification}
        </div>
      )}

      {currentRoom ? <SplitLayout /> : <JoinRoomModal />}
    </div>
  );
};

export function App() {
  return (
    <SocketProvider>
      <MainContent />
    </SocketProvider>
  );
}

export default App;
