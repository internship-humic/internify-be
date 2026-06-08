const transporter = require('../../../helpers/utils/mail');

const sendConfirmationEmail = async (mahasiswa, lowongan) => {
  try {
    const { nama_depan, nama_belakang, email } = mahasiswa;
    const { posisi } = lowongan;
    const fullName = `${nama_depan}${nama_belakang ? ' ' + nama_belakang : ''}`;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Konfirmasi Penerimaan Lamaran Anda',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Lamaran Anda Telah Kami Terima</h2>
          <p>Halo ${fullName},</p>

          <p>Terima kasih telah mengirimkan lamaran untuk posisi <strong>${posisi}</strong> di <strong>Humic Engineering</strong>.</p>

          <p>Kami telah menerima dokumen dan informasi yang Anda kirimkan, dan saat ini tim rekrutmen kami sedang meninjaunya dengan seksama.</p>

          <p>Jika profil Anda sesuai dengan kebutuhan kami, tim kami akan menghubungi Anda untuk tahapan seleksi berikutnya. Proses ini dapat memakan waktu hingga beberapa minggu.</p>

          <p>Kami sangat menghargai minat Anda untuk bergabung bersama tim kami.</p>

          <p>Salam hangat,</p>
          <p><strong>Tim Rekrutmen Humic Engineering</strong></p>

          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #888;">Email ini dikirim secara otomatis. Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami melalui email resmi yang tersedia di website kami.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

const sendStatusEmail = async (lamaran, status, generatedPassword = null) => {
  try {
    const { mahasiswa, lowongan_magang } = lamaran;
    const { nama_depan, nama_belakang, email } = mahasiswa;
    const { posisi } = lowongan_magang;

    const isAccepted = status === 'diterima';
    const fullName = `${nama_depan}${nama_belakang ? ' ' + nama_belakang : ''}`;

    const subject = isAccepted
      ? 'Selamat! Lamaran Anda Diterima'
      : 'Pemberitahuan Status Lamaran Anda';

    const message = isAccepted
      ? `
        <p>Halo ${fullName},</p>
        <p>Selamat! Lamaran Anda untuk posisi <strong>${posisi}</strong> di <strong>Humic Engineering</strong> telah diterima.</p>
        <p>Tim kami sangat terkesan dengan profil dan kualifikasi Anda. Kami akan segera menghubungi Anda terkait tahapan selanjutnya.</p>
        ${generatedPassword ? `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #e0e0e0; font-family: monospace;">
          <p style="margin-top: 0; font-weight: bold; color: #333; font-family: sans-serif;">Akun Portal Intern Anda telah dibuat:</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${generatedPassword}</p>
          <p style="margin-bottom: 0; font-size: 13px; color: #555; font-family: sans-serif;">Silakan masuk menggunakan akun ini untuk melihat project dan tugas magang Anda.</p>
        </div>
        ` : ''}
        <p>Terima kasih telah melamar dan kami menantikan kerja sama yang luar biasa bersama Anda.</p>
      `
      : `
        <p>Halo ${fullName},</p>
        <p>Terima kasih atas lamaran Anda untuk posisi <strong>${posisi}</strong> di <strong>Humic Engineering</strong>.</p>
        <p>Setelah mempertimbangkan secara seksama, kami memutuskan untuk tidak melanjutkan proses lamaran Anda ke tahap berikutnya.</p>
        <p>Jangan berkecil hati—kami sangat menghargai waktu dan usaha Anda. Kami mendorong Anda untuk terus mencoba dan semoga sukses dalam perjalanan karier Anda.</p>
      `;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          ${message}
          <p>Salam hangat,</p>
          <p><strong>Tim Rekrutmen Humic Engineering</strong></p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #888;">Email ini dikirim secara otomatis. Untuk informasi lebih lanjut, silakan hubungi kami melalui kontak resmi.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Gagal mengirim email status lamaran:', error);
  }
};

module.exports = {
  sendConfirmationEmail,
  sendStatusEmail,
};
