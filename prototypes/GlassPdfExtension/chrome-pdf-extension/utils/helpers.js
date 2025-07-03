// Glass PDF Generator - Helper Utilities
// Common functions and utilities used across the extension

/**
 * DOM Utilities
 */
class DOMUtils {
  /**
   * Wait for DOM to be ready
   */
  static ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /**
   * Create element with attributes and children
   */
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'innerHTML') {
        element.innerHTML = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }

  /**
   * Add CSS styles to element
   */
  static addStyles(element, styles) {
    Object.assign(element.style, styles);
  }

  /**
   * Generate unique selector for element
   */
  static generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const className = element.className.split(' ')[0];
      return `.${className}`;
    }
    
    // Generate path-based selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        selector += `.${current.className.split(' ')[0]}`;
      }
      
      // Add nth-child if needed for uniqueness
      const siblings = Array.from(current.parentNode?.children || []);
      const index = siblings.indexOf(current);
      if (siblings.filter(s => s.tagName === current.tagName).length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
      
      path.unshift(selector);
      current = current.parentNode;
    }
    
    return path.join(' > ');
  }

  /**
   * Check if element is visible
   */
  static isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Get element's position relative to document
   */
  static getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * Smooth scroll to element
   */
  static scrollToElement(element, offset = 0) {
    const position = this.getElementPosition(element);
    window.scrollTo({
      top: position.top - offset,
      behavior: 'smooth'
    });
  }
}

/**
 * Storage Utilities
 */
class StorageUtils {
  /**
   * Get data from Chrome storage
   */
  static async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  /**
   * Set data in Chrome storage
   */
  static async set(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }

  /**
   * Remove data from Chrome storage
   */
  static async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(keys, resolve);
    });
  }

  /**
   * Clear all data from Chrome storage
   */
  static async clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(resolve);
    });
  }

  /**
   * Get storage usage
   */
  static async getUsage() {
    return new Promise((resolve) => {
      chrome.storage.sync.getBytesInUse(null, resolve);
    });
  }
}

/**
 * Event Utilities
 */
class EventUtils {
  /**
   * Debounce function execution
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function execution
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Create custom event
   */
  static createEvent(name, detail = {}) {
    return new CustomEvent(name, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }

  /**
   * Wait for event
   */
  static waitForEvent(target, eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        target.removeEventListener(eventName, handler);
        reject(new Error(`Event ${eventName} timeout`));
      }, timeout);

      const handler = (event) => {
        clearTimeout(timer);
        target.removeEventListener(eventName, handler);
        resolve(event);
      };

      target.addEventListener(eventName, handler);
    });
  }
}

/**
 * Validation Utilities
 */
class ValidationUtils {
  /**
   * Validate email address
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate file name
   */
  static isValidFileName(fileName) {
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255;
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName) {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .trim()
      .substring(0, 255);
  }

  /**
   * Validate page number
   */
  static isValidPageNumber(pageNum, totalPages) {
    const num = parseInt(pageNum);
    return !isNaN(num) && num >= 1 && num <= totalPages;
  }

  /**
   * Validate zoom level
   */
  static isValidZoom(zoom) {
    if (typeof zoom === 'string') {
      return ['fit-width', 'fit-page', 'auto'].includes(zoom);
    }
    const num = parseFloat(zoom);
    return !isNaN(num) && num >= 0.1 && num <= 10;
  }
}

/**
 * Format Utilities
 */
class FormatUtils {
  /**
   * Format date
   */
  static formatDate(date, format = 'short') {
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return d.toLocaleTimeString();
      case 'datetime':
        return d.toLocaleString();
      case 'iso':
        return d.toISOString();
      default:
        return d.toString();
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration
   */
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format percentage
   */
  static formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Truncate text
   */
  static truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
}

/**
 * Browser Utilities
 */
class BrowserUtils {
  /**
   * Get browser info
   */
  static getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (userAgent.includes('Chrome/')) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox/')) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari/')) {
      browser = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return { browser, version };
  }

  /**
   * Check if extension context is available
   */
  static isExtensionContext() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  /**
   * Get current tab info
   */
  static async getCurrentTab() {
    if (!this.isExtensionContext()) return null;
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab;
    } catch (error) {
      console.error('Failed to get current tab:', error);
      return null;
    }
  }

  /**
   * Check if URL is valid for extension
   */
  static isValidExtensionURL(url) {
    if (!url) return false;
    
    const invalidPrefixes = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'edge-extension://'
    ];
    
    return !invalidPrefixes.some(prefix => url.startsWith(prefix));
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  }
}

/**
 * Animation Utilities
 */
class AnimationUtils {
  /**
   * Fade in element
   */
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    return new Promise(resolve => {
      const start = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Fade out element
   */
  static fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      const start = performance.now();
      const startOpacity = parseFloat(element.style.opacity) || 1;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = (startOpacity * (1 - progress)).toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Slide down element
   */
  static slideDown(element, duration = 300) {
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    
    return new Promise(resolve => {
      const start = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.height = `${targetHeight * progress}px`;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.height = 'auto';
          element.style.overflow = 'visible';
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
}

/**
 * Error Handling Utilities
 */
class ErrorUtils {
  /**
   * Create user-friendly error message
   */
  static createUserFriendlyError(error) {
    const errorMap = {
      'NetworkError': 'Network connection failed. Please check your internet connection.',
      'TypeError': 'Invalid data received. Please try again.',
      'SecurityError': 'Permission denied. Please allow necessary permissions.',
      'NotAllowedError': 'Action not permitted. Please check browser settings.',
      'AbortError': 'Operation was cancelled.',
      'TimeoutError': 'Operation timed out. Please try again.',
      'QuotaExceededError': 'Storage quota exceeded. Please free up space.'
    };
    
    const errorType = error.constructor.name;
    return errorMap[errorType] || error.message || 'An unexpected error occurred.';
  }

  /**
   * Log error with context
   */
  static logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const browserInfo = BrowserUtils.getBrowserInfo();
    
    console.error(`[${timestamp}] Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      browser: browserInfo,
      url: window.location.href
    });
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry(operation, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
}

// Export all utilities for global access
if (typeof window !== 'undefined') {
  window.GlassPDFUtils = {
    DOM: DOMUtils,
    Storage: StorageUtils,
    Event: EventUtils,
    Validation: ValidationUtils,
    Format: FormatUtils,
    Browser: BrowserUtils,
    Animation: AnimationUtils,
    Error: ErrorUtils
  };
}