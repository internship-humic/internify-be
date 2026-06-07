import db from '../helpers/db/db_connection.js';
import bcrypt from 'bcrypt';

export async function addAdmin(
  nama_depan,
  nama_belakang,
  email,
  plainpassword,
  role
) {
  const saltRounds = 10;
  const hashedPass = await bcrypt.hash(plainpassword, saltRounds);
  const SQLQuery =
    'INSERT INTO admin (nama_depan, nama_belakang, email, password, role) VALUES (? ,?, ?, ?, ?)';
  return db.execute(SQLQuery, [
    nama_depan,
    nama_belakang,
    email,
    hashedPass,
    role,
  ]);
}

export function getAdmin() {
  return db.execute('SELECT * FROM admin');
}

export function getAdminByEmail(email) {
  return db.execute('SELECT * FROM admin WHERE email = ?', [email]);
}

export function getAdminById(id) {
  return db.execute('SELECT * FROM admin WHERE id = ?', [id]);
}


