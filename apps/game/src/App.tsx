import { useEffect, useState } from 'react';
import MainMenu from './screens/MainMenu';
import LevelScreen from './screens/LevelScreen';

function getLevelNumber(): number | null {
  const match = /^#\/fase\/([1-9]\d*)$/.exec(window.location.hash);
  if (!match) return null;

  const levelNumber = Number(match[1]);
  return Number.isSafeInteger(levelNumber) ? levelNumber : null;
}

export default function App() {
  const [levelNumber, setLevelNumber] = useState(getLevelNumber);

  useEffect(() => {
    const handleHashChange = () => setLevelNumber(getLevelNumber());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (levelNumber !== null) {
    return (
      <LevelScreen
        key={levelNumber}
        levelNumber={levelNumber}
        onBackToMenu={() => { window.location.hash = '/'; }}
      />
    );
  }

  return <MainMenu onSelectLevel={(number) => { window.location.hash = `/fase/${number}`; }} />;
}
