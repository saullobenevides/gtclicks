import fs from 'fs';
import path from 'path';

export function logError(error, context = '') {
  const logDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] ${context}: ${error.stack || error.message || error}\n`;

  fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
}

export function logInfo(message) {
    const logDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}\n`;
  
    fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
  }
