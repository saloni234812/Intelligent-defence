const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class SecurityUtils {
  /**
   * Generate secure random token
   * @param {number} length - Token length in bytes
   * @returns {string} Random token
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @param {number} rounds - Bcrypt rounds (default: 12)
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password, rounds = 12) {
    return await bcrypt.hash(password, rounds);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @param {string} secret - JWT secret
   * @param {string} expiresIn - Token expiration
   * @returns {string} JWT token
   */
  static generateJWT(payload, secret = process.env.JWT_SECRET, expiresIn = '24h') {
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @param {string} secret - JWT secret
   * @returns {Object} Decoded payload
   */
  static verifyJWT(token, secret = process.env.JWT_SECRET) {
    return jwt.verify(token, secret);
  }

  /**
   * Generate password reset token
   * @returns {string} Reset token
   */
  static generatePasswordResetToken() {
    return this.generateSecureToken(32);
  }

  /**
   * Encrypt sensitive data
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key
   * @returns {string} Encrypted text
   */
  static encrypt(text, key = process.env.ENCRYPTION_KEY) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted text
   * @param {string} key - Decryption key
   * @returns {string} Decrypted text
   */
  static decrypt(encryptedText, key = process.env.ENCRYPTION_KEY) {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate API key
   * @param {string} prefix - Key prefix
   * @returns {string} API key
   */
  static generateAPIKey(prefix = 'aegis') {
    const randomPart = this.generateSecureToken(24);
    return `${prefix}_${randomPart}`;
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePasswordStrength(password) {
    const result = {
      isValid: true,
      errors: []
    };

    if (password.length < 8) {
      result.isValid = false;
      result.errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one special character');
    }

    return result;
  }

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Generate CSRF token
   * @returns {string} CSRF token
   */
  static generateCSRFToken() {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   * @param {string} token - Token to validate
   * @param {string} sessionToken - Session token
   * @returns {boolean} True if valid
   */
  static validateCSRFToken(token, sessionToken) {
    return token === sessionToken;
  }

  /**
   * Rate limiting key generator
   * @param {Object} req - Express request object
   * @returns {string} Rate limit key
   */
  static generateRateLimitKey(req) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    return crypto.createHash('sha256').update(ip + userAgent).digest('hex');
  }

  /**
   * Check if IP is in whitelist
   * @param {string} ip - IP address
   * @param {Array} whitelist - IP whitelist
   * @returns {boolean} True if whitelisted
   */
  static isIPWhitelisted(ip, whitelist = []) {
    return whitelist.includes(ip) || whitelist.includes('*');
  }

  /**
   * Generate secure session ID
   * @returns {string} Session ID
   */
  static generateSessionID() {
    return this.generateSecureToken(32);
  }
}

module.exports = SecurityUtils;


