import React from 'react';
import { motion } from 'framer-motion';
import styles from './DailyRegister.module.scss';

const DailyRegister = ({ selectedTeam, selectedDate, filteredDrivers, dailyInput, handleDailyChange, handleDailySubmit }) => {
  return (
    <motion.form
      className={styles.form}
      onSubmit={handleDailySubmit}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h2>Registro Diário - {selectedTeam}</h2>
      <label>Data:</label>
      <input type="date" value={selectedDate} onChange={(e) => handleDailyChange('date', e.target.value)} />

      {filteredDrivers.map((driver) => (
        <div key={driver.name} className={styles.driverRow}>
          <span>{driver.name}</span>
          <input
            type="number"
            min="0"
            value={dailyInput[driver.name] || ''}
            onChange={(e) => handleDailyChange(driver.name, e.target.value)}
            placeholder="Encomendas"
            className={styles.smallInput}
          />
        </div>
      ))}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        Salvar Registro
      </motion.button>
    </motion.form>
  );
};

export default DailyRegister;