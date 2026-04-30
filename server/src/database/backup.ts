import fs from 'fs';
import path from 'path';
import db from './connection';

const getBackupDir = (): string => {
  // Check if running in Electron production mode
  if (process.env.NODE_ENV === 'production') {
    try {
      // Try to get Electron's userData path
      const { app } = require('electron');
      const backupDir = path.join(app.getPath('userData'), 'backups');
      return backupDir;
    } catch (error) {
      // Fallback if electron not available
      console.warn('Electron not available, using fallback backup directory');
    }
  }
  
  // Development mode or fallback
  const base = process.env.USER_DATA_PATH || process.cwd();
  return path.join(base, 'backups');
};

const getDbPath = (): string => {
  // Check if running in Electron production mode
  if (process.env.NODE_ENV === 'production') {
    try {
      const { app } = require('electron');
      const dbPath = path.join(app.getPath('userData'), 'database', 'pos_billing.db');
      return dbPath;
    } catch (error) {
      console.warn('Electron not available, using fallback database path');
    }
  }
  
  // Development mode or fallback
  const base = process.env.USER_DATA_PATH || process.cwd();
  return path.join(base, 'database', 'pos_billing.db');
};

export function ensureBackupDir(): void {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created backup directory: ${dir}`);
  }
}

export function createBackup(label: string = 'auto'): string {
  ensureBackupDir();
  const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(getBackupDir(), `pos_backup_${label}_${date}.db`);

  const dbPath = getDbPath();
  
  // Check if source database exists
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Source database not found at: ${dbPath}`);
  }

  // Use SQLite backup API for safe hot backup
  try {
    const backup = (db as any).backup(backupPath);
    backup;
  } catch (err) {
    // Fallback to file copy if SQLite backup fails
    console.log('Using file copy fallback for backup');
  }

  // Fallback: file copy (safe with WAL mode)
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
  return backupPath;
}

export function listBackups(): { name: string; path: string; size: number; date: string }[] {
  ensureBackupDir();
  const dir = getBackupDir();
  
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('pos_backup_') && f.endsWith('.db'))
    .sort()
    .reverse()
    .map(f => {
      const filePath = path.join(dir, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        path: filePath,
        size: stats.size,
        date: stats.mtime.toISOString()
      };
    });
}

export function restoreBackup(backupName: string): void {
  const backupPath = path.join(getBackupDir(), backupName);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupName}`);
  }

  const dbPath = getDbPath();
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Close all connections by checkpointing WAL
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch (err) {
    console.warn('WAL checkpoint failed:', err);
  }

  // Copy backup over current DB
  fs.copyFileSync(backupPath, dbPath);
  console.log(`✅ Restored from backup: ${backupName}`);
}

export function pruneOldBackups(keepCount: number = 7): void {
  const backups = listBackups();
  if (backups.length > keepCount) {
    backups.slice(keepCount).forEach(b => {
      fs.unlinkSync(b.path);
      console.log(`🗑️ Deleted old backup: ${b.name}`);
    });
  }
}

export function checkDbIntegrity(): boolean {
  try {
    const result = db.prepare("PRAGMA integrity_check").get() as any;
    const ok = result.integrity_check === 'ok';
    if (!ok) {
      console.error('⚠️ Database integrity check FAILED:', result.integrity_check);
    }
    return ok;
  } catch (err) {
    console.error('Integrity check error:', err);
    return false;
  }
}

export function scheduleAutoBackup(): void {
  // Backup on startup
  try {
    createBackup('auto');
    pruneOldBackups(7);
  } catch (err) {
    console.error('Startup backup failed:', err);
  }

  // Backup every 24 hours
  setInterval(() => {
    try {
      createBackup('auto');
      pruneOldBackups(7);
    } catch (err) {
      console.error('Scheduled backup failed:', err);
    }
  }, 24 * 60 * 60 * 1000);
}