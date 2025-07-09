// a static lookup of continent → list of country names
export const continentCountries = {
  Africa: [
    "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi",
    "Cameroon","Cape Verde","Central African Republic","Chad","Comoros",
    "Côte d'Ivoire","Djibouti","Eswatini","Egypt","Equatorial Guinea",
    "Eritrea","Ethiopia","Gabon","Ghana","Guinea","Guinea-Bissau",
    "Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali",
    "Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger",
    "Nigeria","Rwanda","São Tomé and Príncipe","Senegal","Seychelles",
    "Sierra Leone","Somalia","South Africa","South Sudan","Sudan",
    "Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe"
  ],
  Antarctica: ["Antarctica"],
  Asia: [
    "Afghanistan","Azerbaijan","Bahrain","Bangladesh","Bhutan","Brunei",
    "Cambodia","China","East Timor","Georgia","India","Indonesia","Iran",
    "Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan",
    "Laos","Lebanon","Malaysia","Maldives","Mongolia","Myanmar","Nepal",
    "North Korea","Oman","Pakistan","Philippines","Qatar","Russia",
    "Saudi Arabia","Singapore","South Korea","Sri Lanka","Syria","Taiwan",
    "Thailand","Turkey","Turkmenistan","United Arab Emirates","Uzbekistan",
    "Vietnam","Yemen"
  ],
  Europe: [
    "Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium",
    "Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czechia","Denmark",
    "Estonia","Finland","France","Georgia","Germany","Greece","Hungary",
    "Iceland","Ireland","Italy","Kazakhstan","Kosovo","Latvia","Liechtenstein",
    "Lithuania","Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands",
    "North Macedonia","Norway","Poland","Portugal","Romania","Russia","San Marino",
    "Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Turkey",
    "Ukraine","United Kingdom","Vatican City"
  ],
  "North America": [
    "Antigua and Barbuda","Bahamas","Barbados","Belize","Canada","Costa Rica",
    "Cuba","Dominica","Dominican Republic","El Salvador","Grenada","Guatemala",
    "Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama","Saint Kitts and Nevis",
    "Saint Lucia","Saint Vincent and the Grenadines","Trinidad and Tobago","United States"
  ],
  "South America": [
    "Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay",
    "Peru","Suriname","Uruguay","Venezuela","Falkland Islands"
  ],
  "Central America": [
    "Belize","Costa Rica","El Salvador","Guatemala","Honduras","Nicaragua","Panama"
  ],
  Caribbean: [
    "Anguilla","Antigua and Barbuda","Aruba","Bahamas","Barbados","Bermuda",
    "British Virgin Islands","Cayman Islands","Cuba","Curacao","Dominica",
    "Dominican Republic","Grenada","Guadeloupe","Haiti","Jamaica","Martinique",
    "Montserrat","Puerto Rico","Saint Lucia","Saint Vincent and the Grenadines",
    "Sint Maarten","Trinidad and Tobago","Turks and Caicos Islands"
  ],
  Oceania: [
    "Australia","Fiji","Kiribati","Marshall Islands","Micronesia","Nauru",
    "New Zealand","Palau","Papua New Guinea","Samoa","Solomon Islands","Tonga",
    "Tuvalu","Vanuatu"
  ],
  "Middle East": [
    "Bahrain","Cyprus","Egypt","Iran","Iraq","Israel","Jordan","Kuwait",
    "Lebanon","Oman","Qatar","Saudi Arabia","Syria","Turkey","United Arab Emirates",
    "Yemen"
  ],
};

/**
 * Returns the (hard-coded) list of countries for a given continent.
 * @param {string} continentName  e.g. "Africa" or "north america"
 * @returns {string[]}
 */
export function getCountriesByContinent(continentName) {
  if (!continentName) return [];
  // normalize capitalization & spacing
  const key = continentName
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return continentCountries[key] || [];
}
