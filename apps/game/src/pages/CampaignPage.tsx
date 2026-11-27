import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getWorldTitle } from '../worlds/getWorldTitle';
import { loadWorldCatalog } from '../worlds/loadWorldCatalog';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; entries: Awaited<ReturnType<typeof loadWorldCatalog>> }
  | { status: 'error' };

export default function CampaignPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const returnStageId: unknown = location.state?.returnStageId;
  const headingRef = useRef<HTMLHeadingElement>(null);
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

  useEffect(() => {
    if (catalog.status === 'loading' || typeof returnStageId !== 'string') return;
    if (document.activeElement !== document.body) return;
    const stage = document.getElementById(`catalog-stage-${returnStageId}`);
    (stage ?? headingRef.current)?.focus();
  }, [catalog.status, returnStageId]);

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Link className="game-control" to="/">{t("menu.back")}</Link>
        <h1 ref={headingRef} tabIndex={-1}>{t('menu.campaign')}</h1>
      </header>
      {catalog.status === 'loading' && <p role="status">{t('world.loading')}</p>}
      {catalog.status === 'error' && <p role="alert">{t('world.loadError')}</p>}
      {catalog.status === 'ready' && catalog.entries.map(({ world, stages }) => (
        <section className="catalog-world" key={world.id} aria-labelledby={`world-${world.id}`}>
          <h2 id={`world-${world.id}`}>
            {getWorldTitle(world, i18n.resolvedLanguage ?? 'en')}
          </h2>
          <nav className="stage-list" aria-label={t('stage.list')}>
            {stages.map((stage) => (
              <Link
                className="game-control catalog-stage"
                id={`catalog-stage-${stage.id}`}
                key={stage.id}
                aria-label={t('stage.title', { number: stage.number })}
                to={`/stage/${stage.id}`}
              >
                {stage.number}
              </Link>
            ))}
          </nav>
        </section>
      ))}
    </main>
  );
}
