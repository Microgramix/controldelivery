import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './DeliveryForm.module.scss';
import teamsData from './teamsData.json';
import DailyRegister from './components/DailyRegister/DailyRegister';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./Firebase/firebase";

const DeliveryForm = () => {
  const [isTouching, setIsTouching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyInput, setDailyInput] = useState({});
  const [recordsByDate, setRecordsByDate] = useState({});
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempSelectedTeam, setTempSelectedTeam] = useState('');

  // Busca dados da equipe selecionada no teamsData.json
  const teamData = useMemo(
    () => teamsData.teams.find((team) => team.name === selectedTeam) || { drivers: [] },
    [selectedTeam]
  );

  // Carrega registros da equipe no Firestore
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

  // Verifica a senha da equipe
  const verifyPassword = () => {
    const team = teamsData.teams.find(team => team.name === tempSelectedTeam);
    if (team && team.password === passwordInput) {
      setSelectedTeam(tempSelectedTeam);
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      alert('Senha incorreta!');
      setPasswordInput('');
    }
  };

  // Handler para seleção de equipe (abre modal de senha)
  const handleTeamSelect = (teamName) => {
    setTempSelectedTeam(teamName);
    setShowPasswordModal(true);
  };

  // Lida com mudanças nos inputs (data ou quantidade)
  const handleDailyChange = (name, value) => {
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 200);

    if (name === 'date') {
      setSelectedDate(value);
    } else {
      setDailyInput((prev) => ({ ...prev, [name]: Math.max(Number(value), 0) }));
    }
  };

  // Salva os registros no Firestore
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 300);

    const newRecord = {
      ...recordsByDate[selectedDate],
      ...Object.entries(dailyInput).reduce((acc, [driver, count]) => {
        acc[driver] = (recordsByDate[selectedDate]?.[driver] || 0) + count;
        return acc;
      }, {})
    };

    try {
      const teamDocRef = doc(db, 'records', selectedTeam);
      await setDoc(teamDocRef, { [selectedDate]: newRecord }, { merge: true });
      setRecordsByDate((prev) => ({ ...prev, [selectedDate]: newRecord }));
      setDailyInput({});
    } catch (error) {
      console.error("Erro ao atualizar os registros:", error);
    }
  };

  // Componente para selecionar a equipe
  const TeamSelector = () => (
    <div className={styles.touchButtonGroup}>
      {teamsData.teams.map((team) => (
        <motion.button
          key={team.name}
          className={`${styles.touchButton} ${selectedTeam === team.name ? styles.active : ''}`}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => handleTeamSelect(team.name)}
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

      {/* Modal de Senha */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className={styles.modalTitle}>Digite a senha para {tempSelectedTeam}</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Senha"
              className={styles.passwordInput}
              autoFocus
            />
            <div className={styles.modalButtons}>
              <motion.button
                onClick={verifyPassword}
                whileTap={{ scale: 0.95 }}
                className={styles.confirmButton}
              >
                Confirmar
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                whileTap={{ scale: 0.95 }}
                className={styles.cancelButton}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryForm;