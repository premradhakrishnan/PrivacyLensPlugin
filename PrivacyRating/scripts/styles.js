// styles.js - Contains all CSS styles used by the extension

// Define PrivacyLens namespace if it doesn't exist
window.PrivacyLens = window.PrivacyLens || {};

// Add styles to the namespace
PrivacyLens.styles = {
  modalStyles: `
.privacy-lens-modal {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: white;
  
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  transition: transform 0.3s ease;
}

.privacy-lens-modal.minimized {
  transform: translateX(calc(100% - 40px));
}

.privacy-lens-header {
  padding: 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(179, 218, 222, 0.5);
}

.privacy-lens-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.privacy-lens-logo {
  width: 245px;
  height: 70px;
  object-fit: contain;
}

.privacy-lens-controls {
  display: flex;
  gap: 8px;
}

.privacy-lens-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 20px;
  color: #6141AC;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.privacy-lens-button:hover {
  opacity: 0.8;
}

.privacy-lens-content {
  padding: 10px 5px 0px 5px;
  /*background-color: rgba(179, 218, 222, 0.1);*/
}

.privacy-lens-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.privacy-lens-table th {
  text-align: left;
  color: #6141AC;
  padding: 0 8px 8px 8px;
  font-weight: 600;
  font-size: 14px;
}

.privacy-lens-table td {
  padding: 4px;
  vertical-align: middle;
}

.privacy-lens-domain-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4282AA;
  font-size: small;
}

.privacy-lens-favicon {
  width: 16px;
  height: 16px;
}

.privacy-lens-rating {
  text-align: right;
  font-weight: 600;
  font-size: small;
}

.privacy-lens-rating.strong {
  color: #78BF26;
}

.privacy-lens-rating.moderate {
  color: #FFA500;
}

.privacy-lens-rating.weak {
  color: #DE0E3F;
}

.privacy-lens-footer {
  padding: 8px 8px 8px 8px;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(179, 218, 222, 0.5);
  font-size: 10px;
  color: #6141AC;
}

.privacy-lens-link {
  text-decoration: none;
  color: #6141AC;
}
  
a:visited {
  color: #6141AC;
}

.privacy-lens-link:hover {
  text-decoration: underline;
}

.privacy-lens-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
}

.privacy-lens-feedback span {
  font-size: smaller;
}

.privacy-lens-feedback-button {
  background: none;
  border: none;
  color: #4282AA;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  font-size: smaller;
}

.privacy-lens-feedback-button:hover {
  transform: scale(1.1);
}

.privacy-lens-summary {
  padding: 12px 12px 0px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.privacy-lens-summary-title {
  font-weight: bold;
  margin-bottom: 6px;
  color: #6141AC;
}
`
};