module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable strict linting for build to pass
    'no-unused-vars': 'warn',
    'no-console': 'warn'
  }
};
