// Base64 polyfill for React Native (required for loading GLB 3D models)
import { decode, encode } from 'base-64';

// Set up global atob and btoa functions
if (typeof global.atob === 'undefined') {
  global.atob = decode;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = encode;
}

// Polyfill for Buffer if needed by Three.js loaders
if (typeof global.Buffer === 'undefined') {
  global.Buffer = {
    from: (str, encoding) => {
      if (encoding === 'base64') {
        return { toString: () => decode(str) };
      }
      return { toString: (enc) => enc === 'base64' ? encode(str) : str };
    }
  };
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);