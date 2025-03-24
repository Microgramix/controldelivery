import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import teamsData from '../../teamsData.json';
import styles from './CompareTeams.module.scss';

// Counter animado usando framer-motion
function Counter({ value }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 20 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    mv.set(value);
    spring.on('change', v => setCount(Math.round(v)));
  }, [value]);

  return <span>{count}</span>;
}

export default function CompareTeams() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const months = new Set();
    teamsData.teams.forEach(({ name }) => {
      const rec = JSON.parse(localStorage.getItem(`records-${name}`) || '{}');
      Object.keys(rec).forEach(date => months.add(date.slice(0, 7)));
    });
    const sorted = Array.from(months).sort();
    setAvailableMonths(sorted);
    if (sorted.length) setSelectedMonth(sorted[0]);
  }, []);

  useEffect(() => {
    if (!teamA || !teamB || teamA === teamB || !selectedMonth) {
      setChartData([]);
      return;
    }
    const getTotals = team =>
      Object.entries(JSON.parse(localStorage.getItem(`records-${team}`) || '{}'))
        .filter(([date]) => date.startsWith(selectedMonth))
        .reduce((acc, [, daily]) => {
          Object.entries(daily).forEach(([driver, count]) => {
            acc[driver] = (acc[driver] || 0) + count;
          });
          return acc;
        }, {});

    const totalsA = getTotals(teamA);
    const totalsB = getTotals(teamB);
    const drivers = Array.from(new Set([...Object.keys(totalsA), ...Object.keys(totalsB)]));

    setChartData(
      drivers
        .map(driver => ({
          driver,
          [teamA]: totalsA[driver] || 0,
          [teamB]: totalsB[driver] || 0,
        }))
        .sort((a, b) => b[teamA] + b[teamB] - (a[teamA] + a[teamB]))
    );
  }, [teamA, teamB, selectedMonth]);

  const renderButtonGroup = (options, value, setter) => (
    <div className={styles.buttonGroup}>
      {options.map(opt => (
        <motion.button
          key={opt}
          className={value === opt ? styles.activeButton : ''}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setter(opt)}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );

  const total = team =>
    chartData.reduce((sum, row) => sum + (row[team] || 0), 0);

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>Comparativo de Equipes</h2>

      <section className={styles.selectorSection}>
        <label>Equipe A</label>
        {renderButtonGroup(teamsData.teams.map(t => t.name), teamA, setTeamA)}

        <label>Equipe B</label>
        {renderButtonGroup(teamsData.teams.map(t => t.name), teamB, setTeamB)}

        <label>Mês</label>
        {renderButtonGroup(availableMonths, selectedMonth, setSelectedMonth)}
      </section>

      {chartData.length ? (
        <>
          <div className={styles.summary}>
            <motion.div className={styles.card} whileHover={{ scale: 1.03 }}>
              <h3>{teamA}</h3>
              <p>
                <Counter value={total(teamA)} /> entregas
              </p>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.03 }}>
              <h3>{teamB}</h3>
              <p>
                <Counter value={total(teamB)} /> entregas
              </p>
            </motion.div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="driver" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121212',
                  border: '2px solid #ce7c00',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#E0E0E0' }}
                itemStyle={{ color: '#E0E0E0' }}
              />
              <Legend wrapperStyle={{ color: '#E0E0E0' }} verticalAlign="top" />
              <Bar dataKey={teamA} fill="#ce8d00" animationDuration={1500} />
              <Bar dataKey={teamB} fill="#ce5600" animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className={styles.message}>Selecione duas equipes diferentes e um mês.</p>
      )}
    </motion.div>
  );
}
