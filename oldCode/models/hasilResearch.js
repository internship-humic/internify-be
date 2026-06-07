import db from '../config/db_connection.js';

export function addhasilResearch(nama_project, deskripsi, link_project, image_path) {
  const SQLQuery =
    'INSERT INTO hasil_research (nama_project, deskripsi, link_project, image_path) VALUES (?,?,?,?)';
  return db.execute(SQLQuery, [nama_project, deskripsi, link_project, image_path]);
}

export function gethasilResearch() {
  return db.execute('SELECT * FROM hasil_research');
}

export function gethasilResearchById(id) {
  return db.execute('SELECT * FROM hasil_research WHERE id = ?', [id]);
}

export function updateHasilResearch(id, nama_project, deskripsi, link_project, image_path) {
  const SQLQuery = `
    UPDATE hasil_research 
    SET nama_project = ?, deskripsi = ?, link_project = ?, image_path = ? 
    WHERE id = ?
  `;
  return db.execute(SQLQuery, [nama_project, deskripsi, link_project, image_path, id]);
}

export function deletehasilResearch(id) {
  return db.execute('DELETE FROM hasil_research WHERE id = ?', [id]);
}