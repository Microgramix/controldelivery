import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.module.scss';
import DeliveryForm from './DeliveryForm';
import CompareTeams from './components/CompareTeams/CompareTeams';
import BottomHeader from './components/BottomHeader/BottomHeader';
import RankingPage from './pages/RankingPage';
import Header from './components/Header/Header'; // importe o Header

const App = () => {
  // Adiciona classe para detectar touch device
  React.useEffect(() => {
    document.body.classList.add('is-touch-device');
    return () => {
      document.body.classList.remove('is-touch-device');
    };
  }, []);

  return (
    <Router>
      {/* Wrapper que ocupa 100% do viewport mobile */}
      <div className={styles.mobileViewport}>
        <div className={styles.appContainer}>
          {/* Header com logo e botão de instalação */}
          <Header />
          {/* Área principal rolável */}
          <main className={styles.contentArea}>
            <Routes>
              <Route path="/" element={<DeliveryForm />} />
              <Route path="/compare" element={<CompareTeams />} />
              <Route path="/ranking" element={<RankingPage />} />
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
