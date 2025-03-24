import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.module.scss';
import DeliveryForm from './DeliveryForm';
import CompareTeams from './components/CompareTeams/CompareTeams';
import BottomHeader from './components/BottomHeader/BottomHeader';
import RankingPage from './pages/RankingPage';

const App = () => {
  return (
    <Router>
      <div className={styles.appContainer}>
        <Routes>
          <Route path="/" element={<DeliveryForm />} />
          <Route path="/compare" element={<CompareTeams />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
        <BottomHeader />
      </div>
    </Router>
  );
};

export default App;
