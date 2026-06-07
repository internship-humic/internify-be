import * as adminService from '../models/admin.js';

export const addAdmin = async (req, res) => {
  const { nama_depan, nama_belakang, email, password } = req.body;
  const role = 'admin';
  const requireRole = req.role;

  try {
    if (requireRole !== 'admin') {
      return res.status(400).json({ message: 'Only admins can access this' });
    }

    const [foundAdmin] = await adminService.getAdminByEmail(email);
    if (foundAdmin.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await adminService.addAdmin(
      nama_depan,
      nama_belakang,
      email,
      password,
      role
    );
    return res.status(200).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdmin = async (_req, res) => {
  try {
    const [admin] = await adminService.getAdmin();
    if (admin.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json({
      message: 'Get all admin successfully',
      data: admin,
    });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
