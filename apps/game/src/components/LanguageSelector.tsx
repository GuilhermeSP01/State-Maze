import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();

  return (
    <label>
      {t('language.label')}{' '}
      <select
        value={i18n.resolvedLanguage ?? 'en'}
        onChange={(event) => { void i18n.changeLanguage(event.target.value); }}
      >
        <option value="en" lang="en">English</option>
        <option value="pt-BR" lang="pt-BR">Português (Brasil)</option>
      </select>
    </label>
  );
}
