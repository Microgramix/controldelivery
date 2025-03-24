import React from 'react';
import { motion } from 'framer-motion';
import styles from './RankingSection.module.scss';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const exportToPdf = async () => {
    const element = document.getElementById('ranking-section');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ranking_${selectedMonth}_week${selectedWeek}.pdf`);
  };

  return (
    <motion.section
      id="ranking-section"
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

          <motion.button
            className={styles.exportButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPdf}
          >
            Exportar PDF
          </motion.button>
        </>
      ) : (
        selectedMonth && <p>Sem registros para {selectedMonth}, semana {selectedWeek}.</p>
      )}
    </motion.section>
  );
};

export default RankingSection;
