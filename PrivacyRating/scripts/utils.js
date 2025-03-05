// utils.js - Utility functions used across the extension

// Define PrivacyLens namespace if it doesn't exist
window.PrivacyLens = window.PrivacyLens || {};

// Add utilities to the namespace
PrivacyLens.utils = {
  /**
   * Gets the URL for an extension resource
   * @param {string} path - Path to the resource
   * @returns {string} Full URL to the resource
   */
  getExtensionURL: function(path) {
    return chrome.runtime.getURL(path);
  },

  /**
   * Gets the current domain name, removing www. prefix
   * @returns {string} Current domain name
   */
  getCurrentDomain: function() {
    let hostname = window.location.hostname;
    return hostname.replace("www.", "");
  },

  /**
   * Extracts domain from a URL
   * @param {string} url - URL to extract domain from
   * @returns {string|null} Domain name or null if invalid URL
   */
  extractDomain: function(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch (err) {
      console.error("Error parsing URL:", url, err);
      return null;
    }
  },

  /**
   * Injects a stylesheet into the page
   * @param {string} css - CSS content to inject
   * @returns {HTMLElement} The injected style element
   */
  injectStyles: function(css) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);
    return styleSheet;
  },

  /**
   * Safely parses JSON
   * @param {string} jsonString - JSON string to parse
   * @param {any} defaultValue - Default value to return if parsing fails
   * @returns {any} Parsed JSON or default value
   */
  safeJsonParse: function(jsonString, defaultValue = {}) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return defaultValue;
    }
  }
};