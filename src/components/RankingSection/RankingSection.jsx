import React from 'react';
import { motion } from 'framer-motion';
import styles from './RankingSection.module.scss';

const RankingSection = ({
  selectedTeam,
  selectedMonth,
  selectedWeek,
  availableMonths,
  ranking,
  totalDeliveries,
  progressPercent,
  weeklyGoal,
  setSelectedMonth,
  setSelectedWeek,
}) => {
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
    <motion.section
      className={styles.rankingSection}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h2>Ranking Agregado</h2>
      <div className={styles.selectors}>
        <div className={styles.monthSelector}>
          <label>Mês:</label>
          {renderButtonGroup(availableMonths, selectedMonth, setSelectedMonth)}
        </div>
        <div className={styles.weekGrid}>
          <label>Semana:</label>
          <div className={styles.weekButtons}>
            {[1, 2, 3, 4, 5].map((week) => (
              <motion.button
                key={week}
                className={selectedWeek === week ? styles.activeButton : ''}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={() => setSelectedWeek(week)}
              >
                {week}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {ranking.length > 0 ? (
        <>
          <motion.ul
            className={styles.rankingList}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {ranking.map((d, i) => (
              <motion.li
                key={d.name}
                className={`${styles.rankingItem} ${i < 3 ? styles.topThree : ''}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              >
                {i < 3 && (
                  <motion.span
                    className={styles.rankIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </motion.span>
                )}
                <strong>{i + 1}°</strong> {d.name}: {d.count}
              </motion.li>
            ))}
          </motion.ul>

          <div className={styles.progressContainer}>
            <motion.div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
            >
              {progressPercent.toFixed(0)}%
            </motion.div>
            <p>Total: {totalDeliveries}/{weeklyGoal}</p>
          </div>
        </>
      ) : (
        selectedMonth && <p>Sem registros para {selectedMonth}, semana {selectedWeek}.</p>
      )}
    </motion.section>
  );
};

export default RankingSection;