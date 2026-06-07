import db from '../helpers/db/db_connection.js';

export function addMahasiswa(
  nama_depan,
  nama_belakang,
  email,
  kontak,
  jurusan,
  role,
  cv_path,
  portofolio_path,
  motivasi,
  relevant_skills
) {
  const SQLQuery =
    'INSERT INTO mahasiswa (nama_depan, nama_belakang, email, kontak, jurusan, role, cv_path, portofolio_path, motivasi, relevant_skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  return db.execute(SQLQuery, [
    nama_depan,
    nama_belakang,
    email,
    kontak,
    jurusan,
    role,
    cv_path,
    portofolio_path,
    motivasi,
    relevant_skills,
  ]);
}

export function getAllMahasiswa() {
  return db.execute('SELECT * FROM mahasiswa');
}

export function getMahasiswaById(id) {
  return db.execute('SELECT * FROM mahasiswa WHERE id = ?', [id]);
}

export function getMahasiswaByEmail(email) {
  return db.execute('SELECT * FROM mahasiswa WHERE email = ?', [email]);
}

export function deleteAllMahasiswa() {
  return db.execute('DELETE FROM mahasiswa');
}
