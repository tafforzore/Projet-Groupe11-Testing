module.exports = {
    mongodbMemoryServerOptions: {
      instance: {
        dbName: 'jest',
      },
      binary: {
        version: '6.0.3', // ou la version MongoDB que tu veux
        skipMD5: true,
      },
      autoStart: false,
    },
  };
  