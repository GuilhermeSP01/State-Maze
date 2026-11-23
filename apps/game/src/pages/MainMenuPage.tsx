import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { getWorldTitle } from '../worlds/getWorldTitle';
import { loadWorldCatalog } from '../worlds/loadWorldCatalog';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; entries: Awaited<ReturnType<typeof loadWorldCatalog>> }
  | { status: 'error' };

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    loadWorldCatalog().then(
      (entries) => {
        if (active) setCatalog({ status: 'ready', entries });
      },
      () => {
        if (active) setCatalog({ status: 'error' });
      },
    );

    return () => { active = false; };
  }, []);

  return (
    <main>
      <h1>State Maze</h1>
      <LanguageSelector />
      {catalog.status === 'loading' && <p role="status">{t('world.loading')}</p>}
      {catalog.status === 'error' && <p role="alert">{t('world.loadError')}</p>}
      {catalog.status === 'ready' && catalog.entries.map(({ world, stages }) => (
        <section key={world.id} aria-labelledby={`world-${world.id}`}>
          <h2 id={`world-${world.id}`}>
            {getWorldTitle(world, i18n.resolvedLanguage ?? 'en')}
          </h2>
          <nav aria-label={t('stage.list')}>
            {stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                aria-label={t('stage.title', { number: stage.number })}
                onClick={() => navigate(`/stage/${stage.id}`)}
              >
                {stage.number}
              </button>
            ))}
          </nav>
        </section>
      ))}
    </main>
  );
}
