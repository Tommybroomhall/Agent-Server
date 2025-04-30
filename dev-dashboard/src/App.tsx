import React, { useState } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import { AgentType } from './types';

function App() {
  const [activeAgent, setActiveAgent] = useState<AgentType>('customer');

  return (
    <div className="App">
      <header className="App-header">
        <h1>WhatsApp AI Business Assistant - Dev Dashboard</h1>
        <div className="agent-selector">
          <button 
            className={activeAgent === 'customer' ? 'active' : ''} 
            onClick={() => setActiveAgent('customer')}
          >
            Customer Agent
          </button>
          <button 
            className={activeAgent === 'staff' ? 'active' : ''} 
            onClick={() => setActiveAgent('staff')}
          >
            Staff Agent
          </button>
          <button 
            className={activeAgent === 'admin' ? 'active' : ''} 
            onClick={() => setActiveAgent('admin')}
          >
            Admin Agent
          </button>
        </div>
      </header>
      <main>
        <ChatWindow agentType={activeAgent} />
      </main>
      <footer>
        <p>WhatsApp AI Business Assistant - Development Mode</p>
      </footer>
    </div>
  );
}

export default App;
