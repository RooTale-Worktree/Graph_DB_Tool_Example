import { useState } from 'react';
import Login from './components/Login/Login';
import SchemaManager from './components/SchemaManager/SchemaManager';
import GraphUploader from './components/GraphUploader/GraphUploader';
import MetadataEditor from './components/MetadataEditor/MetadataEditor';
import './App.css';

type Tab = 'schema' | 'upload' | 'metadata';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('schema');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSkip = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onSkip={handleSkip} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Graph DB Tool</h1>
        <nav className="app-nav">
          <button
            className={activeTab === 'schema' ? 'active' : ''}
            onClick={() => setActiveTab('schema')}
          >
            스키마 관리
          </button>
          <button
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            그래프 업로드
          </button>
          <button
            className={activeTab === 'metadata' ? 'active' : ''}
            onClick={() => setActiveTab('metadata')}
          >
            메타데이터 편집
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'schema' && <SchemaManager />}
        {activeTab === 'upload' && <GraphUploader />}
        {activeTab === 'metadata' && <MetadataEditor />}
      </main>
    </div>
  );
}

export default App;

