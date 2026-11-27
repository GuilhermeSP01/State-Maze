import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import SettingsPanel from '../components/SettingsPanel';

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
  return <main className="catalog-page home-page">
    <h1>State Maze</h1>
    <nav className="mode-list" aria-label={t('menu.choose')}>
      {(['campaign', 'flow', 'challenge'] as const).map((mode) =>
        <Link className={`game-control mode-card mode-${mode}`} to={`/${mode}`} key={mode}>
          {t(`menu.${mode}`)}
        </Link>
      )}
    </nav>
    <Link className="game-control home-settings" to="/settings">{t('menu.settings')}</Link>
  </main>;
}
