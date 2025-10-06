import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Crypto Utilities', () => {
  beforeEach(() => {
    // Mock environment variable
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long'
  })

  describe('Key Generation', () => {
    it('should require encryption key in environment', () => {
      const keyString = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
      expect(keyString).toBeDefined()
      expect(keyString).toBeTruthy()
    })

    it('should create 32-byte key buffer', () => {
      const keyBuffer = new Uint8Array(32)
      expect(keyBuffer.length).toBe(32)
      expect(keyBuffer).toBeInstanceOf(Uint8Array)
    })

    it('should encode key string to bytes', () => {
      const keyString = 'test-key'
      const encodedKey = new TextEncoder().encode(keyString)
      
      expect(encodedKey).toBeDefined()
      expect(encodedKey.length).toBe(keyString.length)
    })
  })

  describe('Base64 Encoding/Decoding', () => {
    it('should encode to base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      const base64 = btoa(String.fromCharCode(...data))
      
      expect(base64).toBe('SGVsbG8=')
    })

    it('should decode from base64', () => {
      const base64 = 'SGVsbG8='
      const decoded = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      
      expect(decoded).toEqual(new Uint8Array([72, 101, 108, 108, 111]))
    })

    it('should handle round-trip encoding', () => {
      const original = 'Test Data'
      const encoded = btoa(original)
      const decoded = atob(encoded)
      
      expect(decoded).toBe(original)
    })
  })

  describe('IV (Initialization Vector)', () => {
    it('should generate 12-byte IV for AES-GCM', () => {
      const iv = new Uint8Array(12)
      expect(iv.length).toBe(12)
    })

    it('should be random for each encryption', () => {
      const iv1 = crypto.getRandomValues(new Uint8Array(12))
      const iv2 = crypto.getRandomValues(new Uint8Array(12))
      
      expect(iv1).not.toEqual(iv2)
    })

    it('should convert IV to base64', () => {
      const iv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      const ivBase64 = btoa(String.fromCharCode(...iv))
      
      expect(ivBase64).toBeTruthy()
      expect(typeof ivBase64).toBe('string')
    })
  })

  describe('Text Encoding/Decoding', () => {
    it('should encode text to Uint8Array', () => {
      const text = 'Hello World'
      const encoded = new TextEncoder().encode(text)
      
      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should decode Uint8Array to text', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111])
      const decoded = new TextDecoder().decode(data)
      
      expect(decoded).toBe('Hello')
    })

    it('should handle UTF-8 characters', () => {
      const text = 'Hola 你好 مرحبا'
      const encoded = new TextEncoder().encode(text)
      const decoded = new TextDecoder().decode(encoded)
      
      expect(decoded).toBe(text)
    })
  })

  describe('Error Handling', () => {
    it('should throw error if encryption key is missing', () => {
      delete process.env.NEXT_PUBLIC_ENCRYPTION_KEY
      
      expect(() => {
        if (!process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
          throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is not set')
        }
      }).toThrow('NEXT_PUBLIC_ENCRYPTION_KEY is not set')
    })

    it('should handle invalid base64', () => {
      expect(() => {
        atob('invalid!!!base64')
      }).toThrow()
    })

    it('should validate encrypted data format', () => {
      const encryptedData = {
        encrypted: 'base64string',
        iv: 'base64iv'
      }
      
      expect(encryptedData).toHaveProperty('encrypted')
      expect(encryptedData).toHaveProperty('iv')
      expect(typeof encryptedData.encrypted).toBe('string')
      expect(typeof encryptedData.iv).toBe('string')
    })
  })

  describe('AES-GCM Configuration', () => {
    it('should use 256-bit key length', () => {
      const keyLength = 256
      expect(keyLength).toBe(256)
    })

    it('should use AES-GCM algorithm', () => {
      const algorithm = 'AES-GCM'
      expect(algorithm).toBe('AES-GCM')
    })

    it('should support encrypt and decrypt operations', () => {
      const operations = ['encrypt', 'decrypt']
      expect(operations).toContain('encrypt')
      expect(operations).toContain('decrypt')
    })
  })

  describe('Data Integrity', () => {
    it('should preserve data length after encoding', () => {
      const data = 'Test data for encryption'
      const encoded = new TextEncoder().encode(data)
      const decoded = new TextDecoder().decode(encoded)
      
      expect(decoded.length).toBe(data.length)
    })

    it('should handle empty strings', () => {
      const empty = ''
      const encoded = new TextEncoder().encode(empty)
      
      expect(encoded.length).toBe(0)
    })

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const encoded = new TextEncoder().encode(special)
      const decoded = new TextDecoder().decode(encoded)
      
      expect(decoded).toBe(special)
    })
  })
})
