const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class FileUploadUtils {
  /**
   * Configure multer storage
   * @param {string} destination - Upload destination directory
   * @param {number} maxSize - Maximum file size in bytes
   * @returns {Object} Multer configuration
   */
  static configureStorage(destination = 'uploads/', maxSize = 10 * 1024 * 1024) {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(destination, { recursive: true });
          cb(null, destination);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: maxSize
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Invalid file type'));
        }
      }
    });
  }

  /**
   * Validate file type
   * @param {string} mimetype - File MIME type
   * @param {Array} allowedTypes - Allowed MIME types
   * @returns {boolean} True if valid
   */
  static validateFileType(mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']) {
    return allowedTypes.includes(mimetype);
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Filename
   * @returns {string} File extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @param {string} prefix - Optional prefix
   * @returns {string} Unique filename
   */
  static generateUniqueFilename(originalName, prefix = '') {
    const ext = this.getFileExtension(originalName);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `${prefix}${timestamp}_${uniqueId}${ext}`;
  }

  /**
   * Delete file safely
   * @param {string} filePath - Path to file
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to file
   * @returns {Promise<boolean>} True if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   * @param {string} filePath - Path to file
   * @returns {Promise<number>} File size in bytes
   */
  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      throw new Error(`Error getting file size: ${error.message}`);
    }
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   */
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Error creating directory: ${error.message}`);
    }
  }

  /**
   * Get file info
   * @param {string} filePath - Path to file
   * @returns {Promise<Object>} File information
   */
  static async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new Error(`Error getting file info: ${error.message}`);
    }
  }
}

module.exports = FileUploadUtils;


