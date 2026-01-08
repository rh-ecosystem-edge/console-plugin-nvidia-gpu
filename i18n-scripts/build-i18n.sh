#!/usr/bin/env bash

set -exuo pipefail

FILE_PATTERN='src/**/*.{js,jsx,ts,tsx,json}'

i18next "${FILE_PATTERN}" -c "./i18next-parser.config.js" -o "locales/\$LOCALE/\$NAMESPACE.json"
