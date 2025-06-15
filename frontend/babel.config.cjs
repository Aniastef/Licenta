// babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // Ensure you have this preset configured for React's new JSX transform
    ['@babel/preset-react', { runtime: 'automatic' }], // <-- CRITICAL CHANGE HERE
  ],
};
