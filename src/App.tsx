import { useState } from 'react';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import StatusBar from './components/layout/StatusBar';
import MessagePanel from './components/messages/MessagePanel';
import MessageInput from './components/messages/MessageInput';
import FileBox from './components/files/FileBox';
import MemberList from './components/members/MemberList';
import KanbanBoard from './components/kanban/KanbanBoard';
import CreateChannel from './components/channels/CreateChannel';

function App() {
  const [currentView, setCurrentView] = useState('channels');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  
  const renderMainContent = () => {
    switch (currentView) {
      case 'channels':
        return (
          <>
            <MessagePanel />
            <MessageInput />
          </>
        );
      case 'files':
        return <FileBox />;
      case 'members':
        return <MemberList />;
      case 'kanban':
        return <KanbanBoard />;
      default:
        return null;
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-[#0F1419] overflow-hidden">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreateChannel={() => setShowCreateChannel(true)}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
      
      <StatusBar />
      
      <CreateChannel
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
      />
    </div>
  );
}

export default App;
