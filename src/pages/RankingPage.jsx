import React, { useEffect, useMemo, useState } from 'react';
import teamsData from '../teamsData.json';
import RankingSection from '../components/RankingSection/RankingSection';
import styles from './RankingPage.module.scss';

export default function RankingPage() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [recordsByDate, setRecordsByDate] = useState({});
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

  const getWeekInMonth = (dateStr) => Math.ceil(new Date(dateStr).getDate() / 7);

  useEffect(() => {
    if (!selectedTeam || !selectedMonth) return setRanking([]);

    const monthRecords = Object.entries(recordsByDate)
      .filter(
        ([date]) =>
          date.startsWith(selectedMonth) && getWeekInMonth(date) === selectedWeek
      )
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

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: 'center', color: '#FFF' }}>Ranking</h1>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <label style={{ color: '#FFF' }}>Equipe:</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
        >
          <option value="">Selecione uma equipe</option>
          {teamsData.teams.map((team) => (
            <option key={team.name} value={team.name}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <RankingSection
          selectedTeam={selectedTeam}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          availableMonths={availableMonths}
          ranking={ranking}
          totalDeliveries={totalDeliveries}
          progressPercent={progressPercent}
          weeklyGoal={weeklyGoal}
          setSelectedMonth={setSelectedMonth}
          setSelectedWeek={setSelectedWeek}
        />
      )}
    </div>
  );
}
