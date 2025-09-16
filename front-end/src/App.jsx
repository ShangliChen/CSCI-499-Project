// App.jsx
import { Brain } from 'lucide-react';
import { useState } from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Resource from './pages/Resource';
import Login from './pages/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('Home');

  const renderPage = () => {
    switch(currentPage) {
      case 'Home':
        return <Home />;
      case 'About':
        return <About />;
      case 'Resource':
        return <Resource />;
      case 'Login':
        return <Login />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f0]">
      {/* Header Section */}
      <header className="bg-[#f5f5f0] py-3 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('Home')}>
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">MindConnect</span>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            {['Home', 'About', 'Resource', 'Login'].map((button) => (
              <button 
                key={button}
                onClick={() => setCurrentPage(button)}
                className={`px-4 py-2 rounded-lg font-medium transition border ${
                  currentPage === button 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-blue-500 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {button}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;