import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import SettingsPanel from '../components/SettingsPanel';

const titleMaze = [
  '2222222',
  '2111102',
  '2022212',
  '2000012',
  '2222222',
].join('');

function TitleMaze() {
  return (
    <div className="home-art" aria-hidden="true">
      <div className="home-maze">
        {Array.from(titleMaze, (tile, index) => (
          <span className="home-tile" data-tile={tile} key={index}>
            {index === 8 && <span className="home-pawn" />}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  return <main className="catalog-page catalog-header">
    <Link className="game-control" to="/">{t('menu.back')}</Link>
    <h1>{t('menu.settings')}</h1>
    <SettingsPanel />
  </main>;
}

export function UpcomingModePage({ mode }: { mode: 'flow' | 'challenge' }) {
  const { t } = useTranslation();
  return <main className="catalog-page catalog-header">
    <Link className="game-control" to="/">{t('menu.back')}</Link>
    <h1>{t(`menu.${mode}`)}</h1>
    <p>{t('menu.upcomingDescription')}</p>
    <Link className="game-control game-control-primary" to="/campaign">{t('menu.playCampaign')}</Link>
  </main>;
}

export default function MainMenuPage() {
  const { t } = useTranslation();
  return (
    <main className="catalog-page direct-menu home-page">
      <header className="home-header">
        <Link className="game-control menu-icon" to="/settings" aria-label={t('menu.settings')}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M10 3h4l.6 2.5 1.1.6 2.5-.7 2 3.5-1.9 1.8v1.3l1.9 1.8-2 3.5-2.5-.7-1.1.7L14 20h-4l-.6-2.7-1.1-.7-2.5.7-2-3.5L5.7 12v-1.3L3.8 8.9l2-3.5 2.5.7 1.1-.6L10 3Z" />
            <circle cx="12" cy="11.5" r="2.8" />
          </svg>
        </Link>
      </header>
      <div className="home-layout">
        <div className="home-copy">
          <h1>State <span>Maze</span></h1>
          <nav className="mode-list" aria-label={t('menu.choose')}>
            <Link className="game-control menu-primary mode-card mode-campaign" to="/campaign">
              {t('menu.campaign')}
            </Link>
            <Link className="game-control mode-card mode-flow" to="/flow">{t('menu.flow')}</Link>
            <Link className="game-control mode-card mode-challenge" to="/challenge">{t('menu.challenge')}</Link>
          </nav>
        </div>
        <TitleMaze />
      </div>
    </main>
  );
}
