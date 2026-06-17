export default {
  '*.{js,jsx,ts,tsx,json,md}': ['prettier --write'],
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
  'package.json': ['prettier --write'],
};
