const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const common = require('./common.js');

const publicDir = path.join(__dirname, './../locales/');

function updateFile(fileName) {
  let file;
  try {
    const fileContent = fs.readFileSync(fileName, 'utf8');
    file = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to read or parse ${fileName}: ${err.message}`);
  }

  if (!file || typeof file !== 'object' || Array.isArray(file)) {
    throw new Error(`Invalid file content in ${fileName}: expected an object`);
  }

  const updatedFile = {};
  const keys = Object.keys(file);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (file[key] === '') {
      // Handle i18next-parser 9.x pluralization format
      // "{{count}} something_one" -> "{{count}} something" (singular)
      // "{{count}} something_other" -> "{{count}} somethings" (plural)

      if (key.includes('{{count}}') && key.endsWith('_one')) {
        // {{count}} something_one -> {{count}} something (singular)
        const baseKey = key.slice(0, -4); // Remove "_one"
        const text = baseKey.replace(/^{{count}}\s+/, '');
        updatedFile[key] = `{{count}} ${pluralize.singular(text)}`;
      } else if (key.includes('{{count}}') && key.endsWith('_other')) {
        // {{count}} something_other -> {{count}} somethings (plural)
        const baseKey = key.slice(0, -6); // Remove "_other"
        const text = baseKey.replace(/^{{count}}\s+/, '');
        updatedFile[key] = `{{count}} ${pluralize(text)}`;
      } else if (key.endsWith('_one')) {
        // simple_one -> simple
        const baseKey = key.slice(0, -4);
        updatedFile[key] = baseKey;
      } else if (key.endsWith('_other')) {
        // simple_other -> simples
        const baseKey = key.slice(0, -6);
        updatedFile[key] = pluralize(baseKey);
      } else {
        // Default: use key as value
        updatedFile[key] = key;
      }
    } else {
      updatedFile[key] = file[key];
    }
  }

  return fs.promises.writeFile(fileName, JSON.stringify(updatedFile, null, 2));
}

async function processLocalesFolder(filePath) {
  if (path.basename(filePath) === 'en') {
    await common.parseFolder(filePath, updateFile);
  }
}

(async () => {
  try {
    await common.parseFolder(publicDir, processLocalesFolder);
  } catch (error) {
    console.error('Failed to set English defaults:', error);
    process.exit(1);
  }
})();
