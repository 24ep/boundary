const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.saltRounds = 12;
    this.tagLength = 16; // 128 bits

    // Get encryption key from environment or generate one
    this.encryptionKey = this.getEncryptionKey();
  }

  // Get encryption key from environment or generate one
  getEncryptionKey() {
    let key = process.env.ENCRYPTION_KEY;

    if (!key) {
      console.warn('⚠️ No encryption key found in environment, generating one...');
      key = crypto.randomBytes(this.keyLength).toString('hex');
      console.warn('⚠️ Generated encryption key. Please set ENCRYPTION_KEY in your environment variables.');
    }

    // Ensure key is the correct length
    if (key.length !== this.keyLength * 2) { // *2 because hex string
      throw new Error('Encryption key must be 64 characters (32 bytes)');
    }

    return Buffer.from(key, 'hex');
  }

  // Encrypt data
  async encrypt(data) {
    try {
      if (!data) {
        return null;
      }

      // Convert data to string if it's not already
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);

      // Encrypt data
      let encrypted = cipher.update(dataString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const tag = cipher.getAuthTag();

      // Combine IV, encrypted data, and auth tag
      const result = {
        iv: iv.toString('hex'),
        encrypted: encrypted,
        tag: tag.toString('hex'),
      };

      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  async decrypt(encryptedData) {
    try {
      if (!encryptedData || !encryptedData.iv || !encryptedData.encrypted || !encryptedData.tag) {
        return null;
      }

      // Convert hex strings back to buffers
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const encrypted = encryptedData.encrypted;
      const tag = Buffer.from(encryptedData.tag, 'hex');

      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt sensitive user data
  async encryptUserData(userData) {
    try {
      const sensitiveFields = [
        'emergencyContacts',
        'medicalInfo',
        'personalNotes',
        'preferences',
      ];

      const encryptedData = { ...userData };

      for (const field of sensitiveFields) {
        if (userData[field] && typeof userData[field] === 'object') {
          encryptedData[field] = await this.encrypt(userData[field]);
        }
      }

      return encryptedData;
    } catch (error) {
      console.error('Encrypt user data error:', error);
      throw error;
    }
  }

  // Decrypt sensitive user data
  async decryptUserData(userData) {
    try {
      const sensitiveFields = [
        'emergencyContacts',
        'medicalInfo',
        'personalNotes',
        'preferences',
      ];

      const decryptedData = { ...userData };

      for (const field of sensitiveFields) {
        if (userData[field] && typeof userData[field] === 'object' && userData[field].encrypted) {
          const decrypted = await this.decrypt(userData[field]);
          if (decrypted) {
            try {
              decryptedData[field] = JSON.parse(decrypted);
            } catch {
              decryptedData[field] = decrypted;
            }
          }
        }
      }

      return decryptedData;
    } catch (error) {
      console.error('Decrypt user data error:', error);
      throw error;
    }
  }

  // Hash password
  async hashPassword(password) {
    try {
      if (!password) {
        throw new Error('Password is required');
      }

      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(password, salt);

      return hash;
    } catch (error) {
      console.error('Hash password error:', error);
      throw error;
    }
  }

  // Compare password with hash
  async comparePassword(password, hash) {
    try {
      if (!password || !hash) {
        return false;
      }

      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Compare password error:', error);
      return false;
    }
  }

  // Generate secure random string
  generateSecureString(length = 32) {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      console.error('Generate secure string error:', error);
      throw error;
    }
  }

  // Generate API key
  generateApiKey() {
    try {
      const prefix = 'bond_';
      const randomPart = this.generateSecureString(24);
      return prefix + randomPart;
    } catch (error) {
      console.error('Generate API key error:', error);
      throw error;
    }
  }

  // Generate JWT secret
  generateJWTSecret() {
    try {
      return this.generateSecureString(64);
    } catch (error) {
      console.error('Generate JWT secret error:', error);
      throw error;
    }
  }

  // Encrypt file data
  async encryptFile(fileBuffer) {
    try {
      if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw new Error('Invalid file buffer');
      }

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);

      // Encrypt file
      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final(),
      ]);

      // Get auth tag
      const tag = cipher.getAuthTag();

      // Combine IV, encrypted data, and auth tag
      const result = Buffer.concat([iv, tag, encrypted]);

      return result;
    } catch (error) {
      console.error('Encrypt file error:', error);
      throw error;
    }
  }

  // Decrypt file data
  async decryptFile(encryptedBuffer) {
    try {
      if (!encryptedBuffer || !Buffer.isBuffer(encryptedBuffer)) {
        throw new Error('Invalid encrypted buffer');
      }

      if (encryptedBuffer.length < this.ivLength + this.tagLength) {
        throw new Error('Invalid encrypted data length');
      }

      // Extract IV, tag, and encrypted data
      const iv = encryptedBuffer.slice(0, this.ivLength);
      const tag = encryptedBuffer.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = encryptedBuffer.slice(this.ivLength + this.tagLength);

      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAuthTag(tag);

      // Decrypt file
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted;
    } catch (error) {
      console.error('Decrypt file error:', error);
      throw error;
    }
  }

  // Encrypt database field
  async encryptField(value) {
    try {
      if (value === null || value === undefined) {
        return null;
      }

      const encrypted = await this.encrypt(value);
      return encrypted;
    } catch (error) {
      console.error('Encrypt field error:', error);
      throw error;
    }
  }

  // Decrypt database field
  async decryptField(encryptedValue) {
    try {
      if (!encryptedValue) {
        return null;
      }

      const decrypted = await this.decrypt(encryptedValue);
      return decrypted;
    } catch (error) {
      console.error('Decrypt field error:', error);
      throw error;
    }
  }

  // Generate secure token
  generateSecureToken(length = 32) {
    try {
      return crypto.randomBytes(length).toString('base64url');
    } catch (error) {
      console.error('Generate secure token error:', error);
      throw error;
    }
  }

  // Hash sensitive data for comparison (one-way)
  async hashSensitiveData(data) {
    try {
      if (!data) {
        return null;
      }

      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');

      return hash;
    } catch (error) {
      console.error('Hash sensitive data error:', error);
      throw error;
    }
  }

  // Encrypt message content
  async encryptMessage(message) {
    try {
      if (!message || !message.content) {
        return message;
      }

      const encryptedContent = await this.encrypt(message.content);
      
      return {
        ...message,
        content: encryptedContent,
        encrypted: true,
      };
    } catch (error) {
      console.error('Encrypt message error:', error);
      throw error;
    }
  }

  // Decrypt message content
  async decryptMessage(message) {
    try {
      if (!message || !message.encrypted || !message.content) {
        return message;
      }

      const decryptedContent = await this.decrypt(message.content);
      
      return {
        ...message,
        content: decryptedContent,
        encrypted: false,
      };
    } catch (error) {
      console.error('Decrypt message error:', error);
      throw error;
    }
  }

  // Encrypt emergency contact data
  async encryptEmergencyContacts(contacts) {
    try {
      if (!contacts || !Array.isArray(contacts)) {
        return contacts;
      }

      const encryptedContacts = [];

      for (const contact of contacts) {
        const encryptedContact = {
          ...contact,
          phoneNumber: await this.encrypt(contact.phoneNumber),
          name: await this.encrypt(contact.name),
          relationship: contact.relationship ? await this.encrypt(contact.relationship) : null,
        };
        encryptedContacts.push(encryptedContact);
      }

      return encryptedContacts;
    } catch (error) {
      console.error('Encrypt emergency contacts error:', error);
      throw error;
    }
  }

  // Decrypt emergency contact data
  async decryptEmergencyContacts(contacts) {
    try {
      if (!contacts || !Array.isArray(contacts)) {
        return contacts;
      }

      const decryptedContacts = [];

      for (const contact of contacts) {
        const decryptedContact = {
          ...contact,
          phoneNumber: await this.decrypt(contact.phoneNumber),
          name: await this.decrypt(contact.name),
          relationship: contact.relationship ? await this.decrypt(contact.relationship) : null,
        };
        decryptedContacts.push(decryptedContact);
      }

      return decryptedContacts;
    } catch (error) {
      console.error('Decrypt emergency contacts error:', error);
      throw error;
    }
  }

  // Generate encryption key pair
  generateKeyPair() {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      return { publicKey, privateKey };
    } catch (error) {
      console.error('Generate key pair error:', error);
      throw error;
    }
  }

  // Encrypt with public key
  encryptWithPublicKey(data, publicKey) {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data, 'utf8')
      );

      return encrypted.toString('base64');
    } catch (error) {
      console.error('Encrypt with public key error:', error);
      throw error;
    }
  }

  // Decrypt with private key
  decryptWithPrivateKey(encryptedData, privateKey) {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedData, 'base64')
      );

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decrypt with private key error:', error);
      throw error;
    }
  }

  // Get encryption status
  getEncryptionStatus() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      ivLength: this.ivLength,
      saltRounds: this.saltRounds,
      hasKey: !!this.encryptionKey,
      keySource: process.env.ENCRYPTION_KEY ? 'environment' : 'generated',
    };
  }

  // Validate encryption key
  validateEncryptionKey(key) {
    try {
      if (!key) {
        return false;
      }

      const keyBuffer = Buffer.from(key, 'hex');
      return keyBuffer.length === this.keyLength;
    } catch (error) {
      return false;
    }
  }

  // Rotate encryption key
  async rotateEncryptionKey(newKey) {
    try {
      if (!this.validateEncryptionKey(newKey)) {
        throw new Error('Invalid new encryption key');
      }

      const oldKey = this.encryptionKey;
      const newKeyBuffer = Buffer.from(newKey, 'hex');

      // Update the encryption key
      this.encryptionKey = newKeyBuffer;

      console.log('✅ Encryption key rotated successfully');

      return {
        success: true,
        message: 'Encryption key rotated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Rotate encryption key error:', error);
      throw error;
    }
  }
}

module.exports = new EncryptionService(); 