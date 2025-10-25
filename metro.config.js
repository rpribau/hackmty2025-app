const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add gltf and bin to asset extensions
config.resolver.assetExts.push('gltf', 'bin', 'glb');

module.exports = config;