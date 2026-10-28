const presets = [
  ['@babel/preset-env', {
    targets: {
      chrome: '80',
      edge: '80',
      firefox: '78',
      safari: '13.1'
    },
    useBuiltIns: false
  }]
];

module.exports = { presets };
