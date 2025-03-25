import React, { useState, useEffect, useMemo } from 'react';
import teamsData from '../teamsData.json';
import RankingSection from '../components/RankingSection/RankingSection';
import styles from './RankingPage.module.scss';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

export default function RankingPage() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [recordsByDate, setRecordsByDate] = useState({});
  const [ranking, setRanking] = useState([]);
  const weeklyGoal = 530;

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
      const fetchTeamRecords = async () => {
        const teamDocRef = doc(db, 'records', selectedTeam);
        const docSnap = await getDoc(teamDocRef);
        if (docSnap.exists()) {
          setRecordsByDate(docSnap.data());
        } else {
          setRecordsByDate({});
        }
        setSelectedMonth('');
        setSelectedWeek(1);
      };
      fetchTeamRecords();
    }
  }, [selectedTeam]);

  const getWeekInMonth = (dateStr) => Math.ceil(new Date(dateStr).getDate() / 7);

  useEffect(() => {
    if (!selectedTeam || !selectedMonth) {
      setRanking([]);
      return;
    }

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
      <h1 className={styles.title}>Ranking</h1>
      <div className={styles.teamSelector}>
        <label className={styles.label}>Equipe:</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className={styles.select}
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
