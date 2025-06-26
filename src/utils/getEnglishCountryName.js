import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import deLocale from 'i18n-iso-countries/langs/de.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(enLocale);
countries.registerLocale(deLocale);
countries.registerLocale(frLocale);
countries.registerLocale(esLocale);

export function getEnglishCountryName(localizedName) {
  const allCodes = Object.keys(countries.getAlpha2Codes());

  for (const code of allCodes) {
    const variants = [
      countries.getName(code, 'de'),
      countries.getName(code, 'fr'),
      countries.getName(code, 'es'),
      countries.getName(code, 'en'),
    ];

    if (variants.includes(localizedName)) {
      return countries.getName(code, 'en');
    }
  }

  return localizedName; // fallback
}
