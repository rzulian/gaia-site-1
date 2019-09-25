module.exports = {
  lintOnSave: false,
  pwa: {
    // Should only be enabled for IOS >= 11.3
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#16508f',
    // Settings should also be changed in public/manifest.json
    // name: 'The Pulsometer', // Also edit in public/index.html
    themeColor: '#16508f',
    // msTileColor: '#000000',
    name: "GaiaForm.io"
  },

  // For development with vue hot reloading, contact correct backend
  devServer: {
    proxy: 'http://localhost:50801/',
    allowedHosts: [
      'gaia.local',
      'localhost:8612'
    ],
  },
}