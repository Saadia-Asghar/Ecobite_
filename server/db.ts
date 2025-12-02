export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
