const plugins = [
  'postcss-preset-env', // already includes `autoprefixer`
];

if (process.env.NODE_ENV === 'production') {
  plugins.push('cssnano'); // should be last in plugins array
}

module.exports = {
  plugins
};
