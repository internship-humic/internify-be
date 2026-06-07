import db from '../helpers/db/db_connection.js';

export function addlowonganMagang(
  id,
  posisi,
  kelompok_peminatan,
  jobdesk,
  lokasi,
  kualifikasi,
  benefit,
  durasi_awal,
  durasi_akhir,
  status_lowongan,
  paid,
  image_path
) {
  const SQLQuery = `INSERT INTO lowongan_magang (id,posisi, kelompok_peminatan, jobdesk, lokasi, kualifikasi, benefit, durasi_awal, durasi_akhir, status_lowongan, paid,created_at,image_path) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?)`;
  return db.execute(SQLQuery, [
    id,
    posisi,
    kelompok_peminatan,
    jobdesk,
    lokasi,
    kualifikasi,
    benefit,
    durasi_awal,
    durasi_akhir,
    status_lowongan,
    paid,
    image_path,
  ]);
}

export function getAllLowonganMagang() {
  return db.execute('SELECT * FROM lowongan_magang');
}

export function getLowonganMagangById(id) {
  return db.execute('SELECT * FROM lowongan_magang WHERE id = ?', [id]);
}

export function getLowonganByKelompokPeminatan(kelompok_peminatan) {
  return db.execute(
    'SELECT * FROM lowongan_magang WHERE kelompok_peminatan = ?',
    [kelompok_peminatan]
  );
}

export function getAllKelompokPeminatan() {
  return db.execute('SELECT DISTINCT kelompok_peminatan FROM lowongan_magang');
}

export function deleteLowonganMagangById(id) {
  return db.execute('DELETE FROM lowongan_magang WHERE id = ?', [id]);
}
