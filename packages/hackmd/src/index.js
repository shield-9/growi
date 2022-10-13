const fs = require('fs');
const path = require('path');

const stylesJSFile = fs.readFileSync(path.resolve(__dirname, '../dist/assets/styles_bundle.js'));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, '../dist/assets/agent_bundle.js'));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, '../dist/assets/styles_bundle.css'));

// export to app as string
export const stylesJS = stylesJSFile.toString();
export const agentJS = agentJSFile.toString();
export const stylesCSS = stylesCSSFile.toString();
