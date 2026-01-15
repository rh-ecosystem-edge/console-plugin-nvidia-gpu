/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const { CustomJSONLexer } = require('./i18n-scripts/lexers');

module.exports = {
  sort: true,
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultNamespace: 'plugin__console-plugin-nvidia-gpu',
  useKeysAsDefaultValue: true,

  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    json: [CustomJSONLexer],

    default: ['JavascriptLexer'],
  },
};
