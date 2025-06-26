const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components', 'countries');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const countriesRaw = fs.readFileSync('countries.txt', 'utf-8').split('\n').filter(Boolean);

const createdOrExisting = [];

countriesRaw.forEach(rawCountry => {
    // Remove spaces from country name
    const country = rawCountry.replace(/\s+/g, '');

    const filename = `${country}.js`;
    const filePath = path.join(targetDir, filename);

    if (fs.existsSync(filePath)) {
        console.log(`Skipped ${filename} (already exists)`);
    } else {
        const content = `import React from "react";

function ${country}() {
    return (
        "Hello"
    );
}

export default ${country};
`;
        fs.writeFileSync(filePath, content);
        console.log(`Created ${filename} in ${targetDir}`);
    }

    createdOrExisting.push(country);
});

// Generate index.js file content
const indexContent = createdOrExisting
    .map(country => `export { default as ${country} } from './${country}';`)
    .join('\n');

// Write or overwrite index.js
const indexPath = path.join(targetDir, 'index.js');
fs.writeFileSync(indexPath, indexContent);
console.log(`Generated index.js with exports for all countries.`);
