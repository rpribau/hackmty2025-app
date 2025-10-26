import { decode as atob, encode as btoa } from 'base-64';
import 'react-native-url-polyfill/auto';

// Polyfill atob and btoa
if (typeof global.atob === 'undefined') {
  global.atob = atob;
}

if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

// Enhanced Buffer polyfill for React Native with proper Base64 support
if (typeof global.Buffer === 'undefined') {
  global.Buffer = class Buffer extends Uint8Array {
    constructor(data, encoding) {
      if (typeof data === 'string') {
        if (encoding === 'base64') {
          const binaryString = atob(data);
          super(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            this[i] = binaryString.charCodeAt(i);
          }
        } else {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(data);
          super(encoded);
        }
      } else if (typeof data === 'number') {
        super(data);
      } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        super(data);
      } else {
        super(0);
      }
    }

    static from(data, encoding) {
      return new Buffer(data, encoding);
    }

    static isBuffer(obj) {
      return obj instanceof Buffer;
    }

    toString(encoding) {
      if (encoding === 'base64') {
        let binary = '';
        for (let i = 0; i < this.length; i++) {
          binary += String.fromCharCode(this[i]);
        }
        return btoa(binary);
      }
      // Default to utf8
      const decoder = new TextDecoder();
      return decoder.decode(this);
    }
  };
}

// Add TextEncoder/TextDecoder if missing
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const utf8 = [];
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        } else {
          i++;
          charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
          utf8.push(
            0xf0 | (charcode >> 18),
            0x80 | ((charcode >> 12) & 0x3f),
            0x80 | ((charcode >> 6) & 0x3f),
            0x80 | (charcode & 0x3f)
          );
        }
      }
      return new Uint8Array(utf8);
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(bytes) {
      return String.fromCharCode.apply(null, new Uint8Array(bytes));
    }
  };
}

console.log('✅ Polyfills initialized (Buffer, atob, btoa, TextEncoder, TextDecoder)');


export default function setupPolyfills() {
  console.log('✅ Polyfills initialized');
}
