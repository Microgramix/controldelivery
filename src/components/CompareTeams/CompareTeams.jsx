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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';

// Counter animado usando framer-motion
function Counter({ value }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 20 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    mv.set(value);
    spring.on('change', (v) => setCount(Math.round(v)));
  }, [value]);

  return <span>{count}</span>;
}

export default function CompareTeams() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Busca os meses disponíveis a partir dos registros no Firestore
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      const monthsSet = new Set();
      const promises = teamsData.teams.map(async (team) => {
        const teamDocRef = doc(db, 'records', team.name);
        const docSnap = await getDoc(teamDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          Object.keys(data).forEach((date) => monthsSet.add(date.slice(0, 7)));
        }
      });
      await Promise.all(promises);
      const sorted = Array.from(monthsSet).sort();
      setAvailableMonths(sorted);
      if (sorted.length) setSelectedMonth(sorted[0]);
    };

    fetchAvailableMonths();
  }, []);

  // Função para buscar os totais de entregas de uma equipe para o mês selecionado
  const getTotals = async (team) => {
    const teamDocRef = doc(db, 'records', team);
    const docSnap = await getDoc(teamDocRef);
    let totals = {};
    if (docSnap.exists()) {
      const data = docSnap.data();
      Object.entries(data)
        .filter(([date]) => date.startsWith(selectedMonth))
        .forEach(([, daily]) => {
          Object.entries(daily).forEach(([driver, count]) => {
            totals[driver] = (totals[driver] || 0) + count;
          });
        });
    }
    return totals;
  };

  useEffect(() => {
    if (!teamA || !teamB || teamA === teamB || !selectedMonth) {
      setChartData([]);
      return;
    }
    const fetchChartData = async () => {
      const totalsA = await getTotals(teamA);
      const totalsB = await getTotals(teamB);
      const drivers = Array.from(new Set([...Object.keys(totalsA), ...Object.keys(totalsB)]));
      const data = drivers
        .map((driver) => ({
          driver,
          [teamA]: totalsA[driver] || 0,
          [teamB]: totalsB[driver] || 0,
        }))
        .sort((a, b) => b[teamA] + b[teamB] - (a[teamA] + a[teamB]));
      setChartData(data);
    };

    fetchChartData();
  }, [teamA, teamB, selectedMonth]);

  const renderButtonGroup = (options, value, setter) => (
    <div className={styles.buttonGroup}>
      {options.map((opt) => (
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

  const total = (team) =>
    chartData.reduce((sum, row) => sum + (row[team] || 0), 0);

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>Comparativo de Equipes</h2>

      <section className={styles.selectorSection}>
        <label>Equipe A</label>
        {renderButtonGroup(teamsData.teams.map((t) => t.name), teamA, setTeamA)}

        <label>Equipe B</label>
        {renderButtonGroup(teamsData.teams.map((t) => t.name), teamB, setTeamB)}

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
