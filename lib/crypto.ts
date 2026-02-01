import crypto from 'crypto'

if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY not set! Using insecure default for development.')
    console.warn('   Generate a secure key with: openssl rand -hex 32')
}

// 32-byte encryption key (AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-only-insecure-key-replace-this-32byte-key'

export function encryptAPIKey(apiKey: string): string {
    try {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32),
            iv
        )

        let encrypted = cipher.update(apiKey, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        const authTag = cipher.getAuthTag()

        // Return as JSON string containing iv, encrypted data, and auth tag
        return JSON.stringify({
            iv: iv.toString('hex'),
            encrypted,
            authTag: authTag.toString('hex'),
        })
    } catch (error) {
        console.error('Encryption error:', error)
        throw new Error('Failed to encrypt API key')
    }
}

export function decryptAPIKey(encryptedData: string): string {
    try {
        const { iv, encrypted, authTag } = JSON.parse(encryptedData)

        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32),
            Buffer.from(iv, 'hex')
        )

        decipher.setAuthTag(Buffer.from(authTag, 'hex'))

        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.error('Decryption error:', error)
        throw new Error('Failed to decrypt API key')
    }
}

export function hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export function maskAPIKey(apiKey: string): string {
    if (apiKey.length <= 8) return '***'
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
}

// Generate a secure encryption key (for setup)
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex')
}
