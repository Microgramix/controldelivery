import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './DeliveryForm.module.scss';
import teamsData from './teamsData.json';
import DailyRegister from './components/DailyRegister/DailyRegister';

// Importa métodos do Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./Firebase/firebase";

const DeliveryForm = () => {
  const [isTouching, setIsTouching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyInput, setDailyInput] = useState({});
  const [recordsByDate, setRecordsByDate] = useState({});

  const teamData = useMemo(
    () => teamsData.teams.find((team) => team.name === selectedTeam) || { drivers: [] },
    [selectedTeam]
  );

  // Busca os registros da equipe selecionada no Firestore
  useEffect(() => {
    if (selectedTeam) {
      const teamDocRef = doc(db, 'records', selectedTeam);
      getDoc(teamDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setRecordsByDate(docSnap.data());
          } else {
            setRecordsByDate({});
          }
        })
        .catch((error) => console.error("Erro ao buscar registros:", error));
    }
  }, [selectedTeam]);

  // Handler para alterações nos inputs
  const handleDailyChange = (name, value) => {
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 200);
    
    if (name === 'date') {
      setSelectedDate(value);
    } else {
      setDailyInput((prev) => ({ ...prev, [name]: Math.max(Number(value), 0) }));
    }
  };

  // Handler para submeter os registros e atualizar o Firestore
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 300);
    
    // Calcula o novo registro para a data selecionada
    const newRecord = {
      ...recordsByDate[selectedDate],
      ...Object.entries(dailyInput).reduce((acc, [name, count]) => {
        acc[name] = (recordsByDate[selectedDate]?.[name] || 0) + count;
        return acc;
      }, {})
    };

    try {
      const teamDocRef = doc(db, 'records', selectedTeam);
      // Atualiza o documento, mesclando os dados existentes
      await setDoc(teamDocRef, { [selectedDate]: newRecord }, { merge: true });
      setRecordsByDate((prev) => ({ ...prev, [selectedDate]: newRecord }));
      setDailyInput({});
    } catch (error) {
      console.error("Erro ao atualizar os registros:", error);
    }
  };

  const TeamSelector = () => (
    <div className={styles.touchButtonGroup}>
      {teamsData.teams.map((team) => (
        <motion.button
          key={team.name}
          className={`${styles.touchButton} ${selectedTeam === team.name ? styles.active : ''}`}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => setSelectedTeam(team.name)}
          aria-pressed={selectedTeam === team.name}
        >
          {team.name}
        </motion.button>
      ))}
    </div>
  );

  return (
    <motion.div
      className={`${styles.mobileContainer} ${isTouching ? styles.touching : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <header className={styles.mobileHeader}>
        <img 
          src="https://fastrack.lu/wp-content/uploads/2023/05/logo-fastrack-white-top-du-site-1024x214.png"
          alt="Logo" 
          className={styles.mobileLogo}
          loading="lazy"
        />
        <h1 className={styles.mobileTitle}>Registro Diário</h1>
      </header>
      <main className={styles.touchScrollArea}>
        <motion.section
          className={styles.selectorSection}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={styles.sectionTitle}>Selecione sua Equipe</h2>
          <TeamSelector />
        </motion.section>
        {selectedTeam && (
          <DailyRegister
            selectedTeam={selectedTeam}
            selectedDate={selectedDate}
            filteredDrivers={teamData.drivers}
            dailyInput={dailyInput}
            handleDailyChange={handleDailyChange}
            handleDailySubmit={handleDailySubmit}
            isMobile={true}
          />
        )}
      </main>
    </motion.div>
  );
};

export default DeliveryForm;
