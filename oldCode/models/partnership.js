import db from '../config/db_connection.js';

export function addPartnership(nama_partner, image_path) {
  const SQLQuery =
    'INSERT INTO partnership (nama_partner,image_path) VALUES (?, ?)';
  return db.execute(SQLQuery, [nama_partner, image_path]);
}

export function getPartnership() {
  return db.execute('SELECT * FROM partnership');
}

export function getPartnershipById(id) {
  return db.execute('SELECT * FROM partnership WHERE id = ?', [id]);
}

export function updatePartnership(id, nama_partner, image_path) {
  const SQLQuery = `
    UPDATE partnership 
    SET nama_partner = ?, image_path = ? 
    WHERE id = ?
  `;
  return db.execute(SQLQuery, [nama_partner, image_path, id]);
}

export function deletePartnership(id) {
  return db.execute('DELETE FROM partnership WHERE id = ?', [id]);
}