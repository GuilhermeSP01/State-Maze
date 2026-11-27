import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { useLighting } from './LightingPreferences';

export default function SettingsPanel() {
  const { t } = useTranslation();
  const { lighting, changeLighting } = useLighting();
  return (
    <div className="settings-panel">
      <LanguageSelector />
      <fieldset className="lighting-options">
        <legend>{t('stage.lighting')}</legend>
        {(['penumbra', 'bloom'] as const).map(option => (
          <label key={option}>
            <input type="checkbox" checked={lighting[option]}
              onChange={event => changeLighting(option, event.target.checked)} />
            {t(`stage.${option}`)}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
