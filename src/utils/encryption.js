import crypto from 'crypto'
import CryptoJS from 'crypto-js'

const ALGORITHM = 'aes-256-ctr'

const encrypt = (buffer, key) => {
    const iv = crypto.randomBytes(16)
    key = crypto
        .createHash('sha256')
        .update(String(key))
        .digest('base64')
        .substr(0, 32)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])
    return result
}

const decrypt = (encrypted, key) => {
    const iv = encrypted.slice(0, 16)
    encrypted = encrypted.slice(16)
    key = crypto
        .createHash('sha256')
        .update(String(key))
        .digest('base64')
        .substr(0, 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return result
}

const encrypt2 = (message, key) => CryptoJS.AES.encrypt(message, key).toString()

const decrypt2 = (encrypted, key) =>
    CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8)

export { encrypt, decrypt, encrypt2, decrypt2 }
