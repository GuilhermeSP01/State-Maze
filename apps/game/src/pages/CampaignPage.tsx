import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getWorldTitle } from '../worlds/getWorldTitle';
import { loadWorldCatalog } from '../worlds/loadWorldCatalog';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; entries: Awaited<ReturnType<typeof loadWorldCatalog>> }
  | { status: 'error' };

type WorldEntry = Awaited<ReturnType<typeof loadWorldCatalog>>[number];
const stagesPerSet = 15;
const slotsPerSet = stagesPerSet + 1;

function BossIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9 4 3l5 3h6l5-3-2 6 2 4v3l-4 2-1 3H9l-1-3-4-2v-3l2-4Z" />
      <path d="m8 12 2 1m6-1-2 1m-2 5v3" />
    </svg>
  );
}

function CampaignWorld({ world, stages }: WorldEntry) {
  const { t, i18n } = useTranslation();
  const carousel = useRef<HTMLDivElement>(null);
  const [activeSet, setActiveSet] = useState(0);
  const byNumber = new Map(stages.map(stage => [stage.number, stage]));
  // World-local numbers reserve each sixteenth slot for the set boss.
  const setNumbers = Array.from(new Set(stages.map(stage => Math.ceil(stage.number / slotsPerSet))));
  if (setNumbers.length === 0) setNumbers.push(1);

  function showSet(index: number) {
    const track = carousel.current;
    if (track) track.scrollTo({ left: track.clientWidth * index });
  }

  return (
    <section className="catalog-world" aria-labelledby={`world-${world.id}`}>
      <header className="campaign-world-header">
        <h2 id={`world-${world.id}`}>{getWorldTitle(world, i18n.resolvedLanguage ?? 'en')}</h2>
        {setNumbers.length > 1 && (
          <div className="campaign-set-controls">
            <button type="button" className="game-control menu-icon" aria-label={t('campaign.previousSet')}
              disabled={activeSet === 0} onClick={() => showSet(activeSet - 1)}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="game-control menu-icon" aria-label={t('campaign.nextSet')}
              disabled={activeSet === setNumbers.length - 1} onClick={() => showSet(activeSet + 1)}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </header>
      <div className="campaign-sets" ref={carousel} onScroll={({ currentTarget }) => {
        if (currentTarget.clientWidth > 0) {
          setActiveSet(Math.round(currentTarget.scrollLeft / currentTarget.clientWidth));
        }
      }}>
        {setNumbers.map(setNumber => {
          const offset = (setNumber - 1) * slotsPerSet;
          const boss = byNumber.get(offset + slotsPerSet);
          return (
            <section className="campaign-set" key={setNumber} aria-label={t('campaign.set', { number: setNumber })}>
              <nav className="stage-list" aria-label={t('stage.list')}>
                {Array.from({ length: stagesPerSet }, (_, index) => {
                  const number = index + 1;
                  const stage = byNumber.get(offset + number);
                  const label = t('stage.title', { number });
                  return stage ? (
                    <Link className="game-control catalog-stage" key={number}
                      id={`catalog-stage-${stage.id}`} aria-label={label} to={`/stage/${stage.id}`}>
                      {number}
                    </Link>
                  ) : (
                    <button className="game-control catalog-stage" type="button" key={number} aria-label={label} disabled>
                      {number}
                    </button>
                  );
                })}
              </nav>
              {boss ? (
                <Link className="game-control menu-primary campaign-boss" id={`catalog-stage-${boss.id}`}
                  to={`/stage/${boss.id}`} aria-label={t('campaign.boss')}>
                  <BossIcon />
                </Link>
              ) : (
                <button type="button" className="game-control campaign-boss" aria-label={t('campaign.boss')} disabled>
                  <BossIcon />
                </button>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default function CampaignPage() {
  const { t } = useTranslation();
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
    <main className="catalog-page direct-menu campaign-page">
      <header className="catalog-header">
        <Link className="game-control menu-icon" to="/" aria-label={t('menu.back')}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m11 5-7 7 7 7M4 12h16" />
          </svg>
        </Link>
        <h1 ref={headingRef} tabIndex={-1}>{t('menu.campaign')}</h1>
      </header>
      {catalog.status === 'loading' && <p role="status">{t('world.loading')}</p>}
      {catalog.status === 'error' && <p role="alert">{t('world.loadError')}</p>}
      {catalog.status === 'ready' && catalog.entries.map(entry => <CampaignWorld key={entry.world.id} {...entry} />)}
    </main>
  );
}
