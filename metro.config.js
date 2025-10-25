// metro.config.js (Modificado para GLB)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Añadir 'glb' a los assets (ya no necesitamos gltf ni bin)
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'gltf' && ext !== 'bin'); // Limpiar anteriores
config.resolver.assetExts.push('glb'); // Añadir glb

module.exports = config;