import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DeliveryForm from './DeliveryForm';
import CompareTeams from './components/CompareTeams/CompareTeams';
import BottomHeader from './components/BottomHeader/BottomHeader';
import RankingPage from './pages/RankingPage';
import AdminTeams from './AdminTeams';
import Header from './components/Header/Header';

const App = () => {
  React.useEffect(() => {
    document.body.classList.add('is-touch-device');
    return () => {
      document.body.classList.remove('is-touch-device');
    };
  }, []);

  return (
    <Router>
      <div className="w-full min-h-screen bg-zinc-900 text-white flex flex-col">
        <div className="flex flex-col min-h-screen">
          {/* Header com logo e botão de instalação */}
          <Header />

          {/* Área principal rolável */}
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<DeliveryForm />} />
              <Route path="/compare" element={<CompareTeams />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/admin-teams" element={<AdminTeams />} />
            </Routes>
          </main>

          {/* Cabeçalho inferior fixo */}
          <BottomHeader />
        </div>
      </div>
    </Router>
  );
};

export default App;
