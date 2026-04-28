import db from '../connection';

export function addAutoPrint(): void {
  const cols = db.prepare("PRAGMA table_info(settings)").all() as any[];
  const hasAutoPrint = cols.some(c => c.name === 'auto_print');
  if (!hasAutoPrint) {
    db.exec(`ALTER TABLE settings ADD COLUMN auto_print INTEGER DEFAULT 0`);
    console.log('Added auto_print column to settings');
  }
}