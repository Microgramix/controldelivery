import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './DeliveryForm.module.scss';
import teamsData from './teamsData.json';
import DailyRegister from './components/DailyRegister/DailyRegister';
import RankingSection from './components/RankingSection/RankingSection';

const DeliveryForm = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyInput, setDailyInput] = useState({});
  const [recordsByDate, setRecordsByDate] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [ranking, setRanking] = useState([]);

  const weeklyGoal = 500;

  const teamData = useMemo(
    () => teamsData.teams.find((team) => team.name === selectedTeam) || { drivers: [] },
    [selectedTeam]
  );
  const filteredDrivers = teamData.drivers;

  const availableMonths = useMemo(
    () => Array.from(new Set(Object.keys(recordsByDate).map((date) => date.slice(0, 7)))),
    [recordsByDate]
  );

  useEffect(() => {
    if (selectedTeam) {
      const stored = localStorage.getItem(`records-${selectedTeam}`);
      setRecordsByDate(stored ? JSON.parse(stored) : {});
      setSelectedMonth('');
      setSelectedWeek(1);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem(`records-${selectedTeam}`, JSON.stringify(recordsByDate));
    }
  }, [selectedTeam, recordsByDate]);

  const handleDailyChange = (name, value) => {
    if (name === 'date') {
      setSelectedDate(value);
    } else {
      setDailyInput((prev) => ({ ...prev, [name]: Math.max(Number(value), 0) }));
    }
  };

  const handleDailySubmit = (e) => {
    e.preventDefault();
    setRecordsByDate((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        ...Object.entries(dailyInput).reduce((acc, [name, count]) => ({
          ...acc,
          [name]: (prev[selectedDate]?.[name] || 0) + count,
        }), {}),
      },
    }));
    setDailyInput({});
  };

  const getWeekInMonth = (dateStr) => Math.ceil(new Date(dateStr).getDate() / 7);

  useEffect(() => {
    if (!selectedTeam || !selectedMonth) return setRanking([]);

    const monthRecords = Object.entries(recordsByDate)
      .filter(([date]) => date.startsWith(selectedMonth) && getWeekInMonth(date) === selectedWeek)
      .map(([, rec]) => rec);

    const totals = filteredDrivers.reduce((acc, driver) => {
      acc[driver.name] = monthRecords.reduce((sum, rec) => sum + (rec[driver.name] || 0), 0);
      return acc;
    }, {});

    const sorted = Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setRanking(sorted);
  }, [selectedTeam, selectedMonth, selectedWeek, recordsByDate, filteredDrivers]);

  const totalDeliveries = ranking.reduce((sum, { count }) => sum + count, 0);
  const progressPercent = Math.min((totalDeliveries / weeklyGoal) * 100, 100);

  const renderButtonGroup = (options, value, setter) => (
    <div className={styles.buttonGroup}>
      {options.map((opt) => (
        <motion.button
          key={opt}
          className={value === opt ? styles.activeButton : ''}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => setter(opt)}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >

<img 
        src="https://fastrack.lu/wp-content/uploads/2023/05/logo-fastrack-white-top-du-site-1024x214.png" // Caminho para a imagem na pasta public
        alt="Logo" 
        className={styles.logo} // Classe para estilização
      />
      
      <h1>Registro Diário de Encomendas</h1>

      <motion.section
        className={styles.selectorSection}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Equipe</h2>
        {renderButtonGroup(teamsData.teams.map((t) => t.name), selectedTeam, setSelectedTeam)}
      </motion.section>

      {selectedTeam && (
        <DailyRegister
          selectedTeam={selectedTeam}
          selectedDate={selectedDate}
          filteredDrivers={filteredDrivers}
          dailyInput={dailyInput}
          handleDailyChange={handleDailyChange}
          handleDailySubmit={handleDailySubmit}
        />
      )}
    </motion.div>
  );
};

export default DeliveryForm;