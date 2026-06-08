const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Diperlukan ketika isi databasenya masih kosong dan ingin menambahkan dummy data sebagai testing development [Rafi 08/06/2026 16:34]
async function main() {
  await prisma.taskSubmission.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.lamaranMagang.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.lowonganMagang.deleteMany({});
  await prisma.mahasiswa.deleteMany({});
  await prisma.riwayatPelamar.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.partnership.deleteMany({});
  await prisma.hasilResearch.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.admin.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin1 = await prisma.admin.create({
    data: {
      nama_depan: 'Admin',
      nama_belakang: 'One',
      email: 'admin1@internify.com',
      password: hashedPassword,
      role: 'admin',
      signature: `Admin-One-${Date.now()}`,
      profile_picture: 'https://placehold.co/150',
      professional_bio: 'Senior Program Manager at Internify.'
    }
  });
  const admin2 = await prisma.admin.create({
    data: {
      nama_depan: 'Admin',
      nama_belakang: 'Two',
      email: 'admin2@internify.com',
      password: hashedPassword,
      role: 'admin',
      signature: `Admin-Two-${Date.now()}`,
      profile_picture: 'https://placehold.co/150',
      professional_bio: 'Lead Engineering Mentor at Internify.'
    }
  });
  const admin3 = await prisma.admin.create({
    data: {
      nama_depan: 'Admin',
      nama_belakang: 'Three',
      email: 'admin3@internify.com',
      password: hashedPassword,
      role: 'admin',
      signature: `Admin-Three-${Date.now()}`,
      profile_picture: 'https://placehold.co/150',
      professional_bio: 'Design Mentor at Internify.'
    }
  });

  const batch1 = await prisma.batch.create({
    data: { id: 1, batch_number: 1, is_active: false }
  });
  const batch2 = await prisma.batch.create({
    data: { id: 2, batch_number: 2, is_active: false }
  });
  const batch3 = await prisma.batch.create({
    data: { id: 3, batch_number: 3, is_active: true }
  });

  await prisma.hasilResearch.createMany({
    data: [
      {
        nama_project: 'AI Intern Matcher',
        deskripsi: 'Match students using machine learning algorithms',
        image_path: 'https://placehold.co/600x400',
        link_project: 'https://github.com/internify/ai-matcher'
      },
      {
        nama_project: 'Feedback Sentiment Analyzer',
        deskripsi: 'Analyze student feedback sentiment trends',
        image_path: 'https://placehold.co/600x400',
        link_project: 'https://github.com/internify/sentiment'
      },
      {
        nama_project: 'LMS Portal Engine',
        deskripsi: 'Modular learning management system backend',
        image_path: 'https://placehold.co/600x400',
        link_project: 'https://github.com/internify/lms'
      }
    ]
  });

  await prisma.partnership.createMany({
    data: [
      { nama_partner: 'Google Indonesia', image_path: 'https://placehold.co/150' },
      { nama_partner: 'Microsoft Indonesia', image_path: 'https://placehold.co/150' },
      { nama_partner: 'Meta APAC', image_path: 'https://placehold.co/150' }
    ]
  });

  // 5. Faq
  await prisma.faq.createMany({
    data: [
      { pertanyaan: 'Bagaimana cara mendaftar magang?', jawaban: 'Buka menu Lowongan Magang, pilih salah satu lowongan aktif, dan klik tombol daftar.' },
      { pertanyaan: 'Apakah program magang ini berbayar?', jawaban: 'Tergantung pada tipe lowongan (paid/unpaid). Detail tertera di tiap deskripsi lowongan.' },
      { pertanyaan: 'Berapa lama durasi program magang?', jawaban: 'Biasanya durasi magang berlangsung antara 3 hingga 6 bulan penuh.' }
    ]
  });

  // 6. Feedback
  await prisma.feedback.createMany({
    data: [
      { nama: 'Budi Utomo', universitas: 'Institut Teknologi Bandung', pesan: 'Pengalaman magang yang luar biasa! Mentornya ramah dan proyeknya menantang.', batch: 1, posisi: 'Web Developer', tahun: 2025, image_path: 'https://placehold.co/150' },
      { nama: 'Siti Aminah', universitas: 'Universitas Indonesia', pesan: 'Mendapatkan banyak wawasan praktis tentang UI/UX prototyping di industri nyata.', batch: 2, posisi: 'UI/UX Designer', tahun: 2025, image_path: 'https://placehold.co/150' },
      { nama: 'Andi Wijaya', universitas: 'Universitas Gadjah Mada', pesan: 'Sangat direkomendasikan bagi mahasiswa yang ingin belajar data engineering dengan benar.', batch: 2, posisi: 'Data Analyst', tahun: 2026, image_path: 'https://placehold.co/150' }
    ]
  });

  // 7. RiwayatPelamar
  await prisma.riwayatPelamar.createMany({
    data: [
      { batch: 1, negara: 'Indonesia', posisi: 'Web Developer', tahun: 2025, jumlah: 100, pelamar_diterima: 10, pelamar_ditolak: 70, pelamar_diproses: 20, presentase_diterima: 10.0, presentase_ditolak: 70.0, presentase_diproses: 20.0 },
      { batch: 2, negara: 'Indonesia', posisi: 'UI/UX Designer', tahun: 2025, jumlah: 150, pelamar_diterima: 15, pelamar_ditolak: 120, pelamar_diproses: 15, presentase_diterima: 10.0, presentase_ditolak: 80.0, presentase_diproses: 10.0 },
      { batch: 2, negara: 'Malaysia', posisi: 'Data Analyst', tahun: 2026, jumlah: 50, pelamar_diterima: 5, pelamar_ditolak: 40, pelamar_diproses: 5, presentase_diterima: 10.0, presentase_ditolak: 80.0, presentase_diproses: 10.0 }
    ]
  });

  // 8. Mahasiswa
  const mhs1 = await prisma.mahasiswa.create({
    data: { nama_depan: 'Rafi', nama_belakang: 'Athallah', email: 'rafi@student.com', kontak: '08123456789', jurusan: 'Teknik Informatika', universitas: 'ITS', negara: 'Indonesia', cv_path: 'https://example.com/cv-rafi.pdf', portofolio_path: 'https://example.com/portfolio-rafi.pdf', motivasi: 'Ingin mendalami Node.js', relevant_skills: 'Node.js, React, MySQL' }
  });
  const mhs2 = await prisma.mahasiswa.create({
    data: { nama_depan: 'Alice', nama_belakang: 'Smith', email: 'alice@student.com', kontak: '08234567890', jurusan: 'Sistem Informasi', universitas: 'UI', negara: 'Indonesia', cv_path: 'https://example.com/cv-alice.pdf', portofolio_path: 'https://example.com/portfolio-alice.pdf', motivasi: 'Tertarik dengan UI/UX design', relevant_skills: 'Figma, CSS, React' }
  });
  const mhs3 = await prisma.mahasiswa.create({
    data: { nama_depan: 'Bob', nama_belakang: 'Johnson', email: 'bob@student.com', kontak: '08345678901', jurusan: 'Ilmu Komputer', universitas: 'UGM', negara: 'Indonesia', cv_path: 'https://example.com/cv-bob.pdf', portofolio_path: 'https://example.com/portfolio-bob.pdf', motivasi: 'Ingin berkarir di data science', relevant_skills: 'Python, SQL, R' }
  });

  // 9. LowonganMagang
  const lowongan1 = await prisma.lowonganMagang.create({
    data: { id: 'LOW-001', posisi: 'Web Developer', kelompok_peminatan: 'Software Engineering', image_path: 'https://placehold.co/600x400', jobdesk: 'Build REST APIs and user interfaces', lokasi: 'Remote', kualifikasi: 'Knowledge of Node.js & React', benefit: 'Certificate, stipend', durasi_awal: new Date('2026-07-01'), durasi_akhir: new Date('2026-12-31'), id_batch: batch3.id, status_lowongan: 'dibuka', paid: 'paid' }
  });
  const lowongan2 = await prisma.lowonganMagang.create({
    data: { id: 'LOW-002', posisi: 'UI/UX Designer', kelompok_peminatan: 'Design', image_path: 'https://placehold.co/600x400', jobdesk: 'Create wireframes, mockups, and high-fidelity designs', lokasi: 'Hybrid', kualifikasi: 'Proficiency in Figma', benefit: 'Certificate, mentoring', durasi_awal: new Date('2026-07-01'), durasi_akhir: new Date('2026-12-31'), id_batch: batch3.id, status_lowongan: 'dibuka', paid: 'unpaid' }
  });
  const lowongan3 = await prisma.lowonganMagang.create({
    data: { id: 'LOW-003', posisi: 'Data Analyst', kelompok_peminatan: 'Data Science', image_path: 'https://placehold.co/600x400', jobdesk: 'Analyze dataset and create interactive dashboard', lokasi: 'Onsite', kualifikasi: 'Skills in Python, SQL, Tableau', benefit: 'Certificate, meals', durasi_awal: new Date('2026-07-01'), durasi_akhir: new Date('2026-12-31'), id_batch: batch3.id, status_lowongan: 'dibuka', paid: 'paid' }
  });

  // 10. Project
  const proj1 = await prisma.project.create({
    data: { id_admin: admin1.id, project_icon: 'code', project_name: 'Internify Platform Dev', description: 'Upgrading the core Internify platform backend and web client.', start_date: new Date('2026-07-15'), end_date: new Date('2026-10-15'), max_members: 5, status: 'active' }
  });
  const proj2 = await prisma.project.create({
    data: { id_admin: admin2.id, project_icon: 'shield', project_name: 'Auth Gateway Module', description: 'Securing API gateway with unified OAuth2 authentication.', start_date: new Date('2026-07-15'), end_date: new Date('2026-10-15'), max_members: 3, status: 'active' }
  });
  const proj3 = await prisma.project.create({
    data: { id_admin: admin1.id, project_icon: 'chart', project_name: 'Recruitment Analytics Dashboard', description: 'Developing analytical charts for recruitment metrics.', start_date: new Date('2026-07-15'), end_date: new Date('2026-10-15'), max_members: 4, status: 'active' }
  });

  // 11. LamaranMagang
  const lamaran1 = await prisma.lamaranMagang.create({
    data: { id_mahasiswa: mhs1.id, id_lowongan_magang: lowongan1.id, status: 'diterima', batch: batch3.id, update_at: new Date() }
  });
  const lamaran2 = await prisma.lamaranMagang.create({
    data: { id_mahasiswa: mhs2.id, id_lowongan_magang: lowongan2.id, status: 'diterima', batch: batch3.id, update_at: new Date() }
  });
  const lamaran3 = await prisma.lamaranMagang.create({
    data: { id_mahasiswa: mhs3.id, id_lowongan_magang: lowongan3.id, status: 'diterima', batch: batch3.id, update_at: new Date() }
  });

  // 12. Task
  const task1 = await prisma.task.create({
    data: { id_project: proj1.id, title: 'Database Setup', description: 'Setup database schema and write initial seed script.', deadline_at: new Date('2026-08-01'), submission_type: 'url_link' }
  });
  const task2 = await prisma.task.create({
    data: { id_project: proj1.id, title: 'API Specification', description: 'Draft comprehensive swagger API document.', deadline_at: new Date('2026-08-15'), submission_type: 'file_upload' }
  });
  const task3 = await prisma.task.create({
    data: { id_project: proj2.id, title: 'Implement JWT Validation', description: 'Setup middleware and keys for JWT validation.', deadline_at: new Date('2026-08-10'), submission_type: 'url_link' }
  });

  // 13. User
  const user1 = await prisma.user.create({
    data: { id_mahasiswa: mhs1.id, id_lamaran_magang: lamaran1.id, full_name: 'Rafi Athallah', email: 'rafi@student.com', password: hashedPassword, role: 'intern', is_active: true }
  });
  const user2 = await prisma.user.create({
    data: { id_mahasiswa: mhs2.id, id_lamaran_magang: lamaran2.id, full_name: 'Alice Smith', email: 'alice@student.com', password: hashedPassword, role: 'intern', is_active: true }
  });
  const user3 = await prisma.user.create({
    data: { id_mahasiswa: mhs3.id, id_lamaran_magang: lamaran3.id, full_name: 'Bob Johnson', email: 'bob@student.com', password: hashedPassword, role: 'intern', is_active: true }
  });

  // 14. ProjectMember
  await prisma.projectMember.createMany({
    data: [
      { id_project: proj1.id, id_user: user1.id, status: 'active' },
      { id_project: proj1.id, id_user: user2.id, status: 'active' },
      { id_project: proj2.id, id_user: user3.id, status: 'active' }
    ]
  });

  // 15. TaskSubmission
  await prisma.taskSubmission.createMany({
    data: [
      { id_task: task1.id, id_user: user1.id, url_link: 'https://github.com/rafiathallah3' },
      { id_task: task2.id, id_user: user2.id, file_path: 'https://example.com/submission-alice.zip' },
      { id_task: task3.id, id_user: user3.id, url_link: 'https://github.com/bob/auth-gateway' }
    ]
  });
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
