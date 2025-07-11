// a static lookup of continent → list of country names (exactly as in your routes)
export const continentCountries = {
  Africa: [
    "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi",
    "Cameroon","Cape Verde","Central African Republic","Chad","Comoros",
    "DR Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea","Eswatini",
    "Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau",
    "Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar",
    "Malawi","Mali","Mauritania","Mauritius","Mayotte","Morocco",
    "Mozambique","Namibia","Niger","Nigeria","Republic of the Congo",
    "Reunion","Rwanda","Sao Tome and Principe","Senegal","Seychelles",
    "Sierra Leone","Somalia","South Africa","South Sudan","Sudan",
    "Tanzania","Togo","Tunisia","Uganda","Western Sahara","Zambia","Zimbabwe"
  ],
  Antarctica: [
    "Antarctica"
  ],
  Asia: [
    "Afghanistan","Armenia","Azerbaijan","Bahrain","Bangladesh","Bhutan",
    "Brunei","Cambodia","China","Georgia","Hong Kong","India","Indonesia",
    "Iran","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait",
    "Kyrgyzstan","Laos","Lebanon","Macau","Malaysia","Maldives","Mongolia",
    "Myanmar","Nepal","North Korea","Oman","Pakistan","Palestine",
    "Philippines","Qatar","Saudi Arabia","Singapore","South Korea",
    "Sri Lanka","Syria","Taiwan","Tajikistan","Thailand","Timor-Leste",
    "Turkey","Turkmenistan","United Arab Emirates","Uzbekistan","Vietnam","Yemen"
  ],
  Europe: [
    "Albania","Andorra","Austria","Belarus","Belgium",
    "Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus",
    "Czech Republic","Denmark","Estonia","Faroe Islands","Finland",
    "France","Germany","Gibraltar","Greece","Guernsey","Hungary",
    "Iceland","Ireland","Isle of Man","Italy","Jersey","Latvia",
    "Liechtenstein","Lithuania","Luxembourg","Malta","Moldova","Monaco",
    "Montenegro","Netherlands","North Macedonia","Norway","Poland",
    "Portugal","Romania","Russia","San Marino","Serbia","Slovakia",
    "Slovenia","Spain","Sweden","Switzerland","Ukraine",
    "United Kingdom","Vatican City"
  ],
  "North America": [
    "Anguilla","Antigua and Barbuda","Aruba","Bahamas","Barbados",
    "Belize","Bermuda","British Virgin Islands","Canada","Cayman Islands",
    "Costa Rica","Cuba","Curacao","Dominica","Dominican Republic",
    "El Salvador","Greenland","Grenada","Guadeloupe","Guatemala","Haiti",
    "Honduras","Jamaica","Martinique","Mexico","Montserrat","Nicaragua",
    "Panama","Puerto Rico","Saint Barthelemy","Saint Kitts and Nevis",
    "Saint Lucia","Saint Martin","Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines","Sint Maarten","Trinidad and Tobago",
    "Turks and Caicos Islands","United States","United States Virgin Islands"
  ],
  Oceania: [
    "American Samoa","Australia","Cook Islands","Fiji","French Polynesia",
    "Guam","Kiribati","Marshall Islands","Micronesia","Nauru",
    "New Caledonia","New Zealand","Niue","Northern Mariana Islands",
    "Palau","Papua New Guinea","Samoa","Solomon Islands","Tokelau",
    "Tonga","Tuvalu","Vanuatu","Wallis and Futuna"
  ],
  "South America": [
    "Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador",
    "Falkland Islands","French Guiana","Guyana","Paraguay","Peru",
    "Suriname","Uruguay","Venezuela"
  ]
};

/**
 * Returns the (hard‐coded) list of countries for a given continent.
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
