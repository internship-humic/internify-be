import db from '../config/db_connection.js';

export function addlowonganMagang(id_mahasiswa, id_lowongan_magang, status) {
  const SQLQuery =
    'INSERT INTO lamaran_magang (id_mahasiswa, id_lowongan_magang, status, created_at, update_at) VALUES (?, ?, ?, NOW(), NOW())';
  return db.execute(SQLQuery, [id_mahasiswa, id_lowongan_magang, status]);
}

export function getAllLamaranMagang() {
  const SQLQuery = `
  SELECT 
    lm.id,
    m.nama_depan,
    m.nama_belakang,
    l.posisi,
    l.kelompok_peminatan,
    lm.status,
    lm.created_at
    FROM 
        lamaran_magang lm
    JOIN 
        mahasiswa m ON lm.id_mahasiswa = m.id
    JOIN 
        lowongan_magang l ON lm.id_lowongan_magang = l.id;
`;
  return db.execute(SQLQuery);
}

export function getLamaranByID(id_lamaran_magang) {
  const SQLQuery = `
  SELECT 
    m.nama_depan,
    m.nama_belakang,
    m.email,
    m.kontak,
    m.jurusan,
    m.cv_path,
    m.portofolio_path,
    m.motivasi,
    m.relevant_skills,
    l.posisi,
    lm.status
    FROM 
        lamaran_magang lm
    JOIN 
        mahasiswa m ON lm.id_mahasiswa = m.id
    JOIN 
        lowongan_magang l ON lm.id_lowongan_magang = l.id
    WHERE lm.id = ?;
`;
  return db.execute(SQLQuery, [id_lamaran_magang]);
}

export function updateStatusLamaran(id_lamaran_magang, status) {
  const SQLQuery =
    'UPDATE lamaran_magang SET status = ?, update_at = NOW() WHERE id = ?';
  return db.execute(SQLQuery, [status, id_lamaran_magang]);
}

export function getDetailLamaranById(idLamaran) {
  const SQLQuery = `
      SELECT 
        lm.id AS id_lamaran,
        lm.status,
        lm.created_at,
        lm.update_at,

        m.id AS id_mahasiswa,
        m.nama_depan,
        m.nama_belakang,
        m.email,
        m.kontak,
        m.jurusan,
        m.cv_path,
        m.portofolio_path,
        m.motivasi,
        m.relevant_skills,

        l.id AS id_lowongan,
        l.posisi,
        l.kelompok_peminatan,
        l.image_path,
        l.jobdesk,
        l.lokasi,
        l.kualifikasi,
        l.benefit,
        l.durasi_awal,
        l.durasi_akhir,
        l.status_lowongan,
        l.paid,
        l.created_at AS created_at_lowongan

      FROM lamaran_magang lm
      JOIN mahasiswa m ON lm.id_mahasiswa = m.id
      JOIN lowongan_magang l ON lm.id_lowongan_magang = l.id
      WHERE lm.id = ?;
    `;
  return db.execute(SQLQuery, [idLamaran]);
}

export function getAllExportData() {
  const SQLQuery = `
  SELECT 
    m.nama_depan,
    m.nama_belakang,
    m.email,
    m.kontak,
    m.jurusan,
    l.posisi,
    l.kelompok_peminatan
    FROM 
        lamaran_magang lm
    JOIN 
        mahasiswa m ON lm.id_mahasiswa = m.id
    JOIN 
        lowongan_magang l ON lm.id_lowongan_magang = l.id;
`;
  return db.execute(SQLQuery);
}

export function deleteAllLamaranMagang() {
  return db.execute('DELETE FROM lamaran_magang');
}
