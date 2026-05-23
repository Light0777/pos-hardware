import db from '../connection';

export function addSoftDelete(): void {
  const cols = db.prepare("PRAGMA table_info(products)").all() as any[];
  const hasDeleted = cols.some(c => c.name === 'is_deleted');
  if (!hasDeleted) {
    db.exec(`ALTER TABLE products ADD COLUMN is_deleted INTEGER DEFAULT 0`);
    console.log('Added is_deleted column to products');
  }
}