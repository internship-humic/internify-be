const bcrypt = require('bcrypt');
const adminService = require('../../admin/services/admin.service');
const { createToken } = require('../../../middleware/verifyJWT');
const { data, error } = require('../../../helpers/utils/wrapper');
const { UnauthorizedError, NotFoundError, ForbiddenError, ConflictError, BadRequestError } = require('../../../helpers/error');
const prisma = require('../../../helpers/db/db_connection');

class AuthService {
  async login(email, password) {
    try {
      let userRecord = null;
      let isUserAdmin = false;

      const adminResult = await adminService.getAdminByEmail(email);
      if (adminResult.data) {
        userRecord = adminResult.data;
        isUserAdmin = true;
      } else {
        const internRecord = await prisma.user.findUnique({
          where: {
            email: email,
            is_active: true
          }
        });
        if (internRecord) {
          userRecord = internRecord;
          isUserAdmin = false;
        }
      }

      if (!userRecord) {
        return error(new UnauthorizedError('Email atau password tidak valid'));
      }

      const isPasswordValid = await bcrypt.compare(password, userRecord.password);

      if (!isPasswordValid) {
        return error(new UnauthorizedError('Email atau password tidak valid'));
      }

      const role = isUserAdmin ? (userRecord.role || 'admin') : 'intern';

      const tokenPayload = {
        id: userRecord.id.toString(),
        email: userRecord.email,
        role: role,
        signature: isUserAdmin ? userRecord.signature : null
      };

      const token = createToken(tokenPayload);

      if (isUserAdmin) {
        return data({
          token,
          user: {
            id: userRecord.id.toString(),
            full_name: `${userRecord.nama_depan}${userRecord.nama_belakang ? ' ' + userRecord.nama_belakang : ''}`,
            email: userRecord.email,
            role: role,
            signature: userRecord.signature
          },
          admin: {
            id: userRecord.id.toString(),
            nama_depan: userRecord.nama_depan,
            nama_belakang: userRecord.nama_belakang,
            email: userRecord.email,
            role: role,
            signature: userRecord.signature,
          }
        });
      } else {
        return data({
          token,
          user: {
            id: userRecord.id.toString(),
            full_name: userRecord.full_name,
            email: userRecord.email,
            role: role,
          }
        });
      }
    } catch (err) {
      return error(err);
    }
  }

  async getCurrentUser(userId, role) {
    try {
      if (role === 'admin') {
        const result = await adminService.getAdminById(userId);

        if (result.err) {
          return result;
        }

        const { password, ...adminWithoutPassword } = result.data;

        return data({
          ...adminWithoutPassword,
          role: 'admin'
        });
      } else if (role === 'intern') {
        const user = await prisma.user.findUnique({
          where: {
            id: parseInt(userId),
            is_active: true
          },
          include: {
            lamaran_magang: {
              include: {
                lowongan_magang: {
                  select: {
                    posisi: true,
                    kelompok_peminatan: true
                  }
                }
              }
            }
          }
        });

        if (!user) {
          return error(new NotFoundError('Pengguna tidak ditemukan'));
        }

        const { password, ...userWithoutPassword } = user;

        return data(userWithoutPassword);
      } else {
        return error(new NotFoundError('Role tidak valid'));
      }
    } catch (err) {
      return error(new NotFoundError('Pengguna tidak ditemukan'));
    }
  }

  generateToken(payload) {
    try {
      const token = createToken(payload);
      return data(token);
    } catch (err) {
      return error(err);
    }
  }

  async updateProfile(userId, role, payload, imageFile) {
    try {
      const { full_name, email, password, professional_bio } = payload;

      if (email) {
        const existingAdmin = await prisma.admin.findUnique({
          where: { email }
        });
        if (existingAdmin && (role !== 'admin' || existingAdmin.id !== parseInt(userId))) {
          if (imageFile?.filename) {
            const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
            await deleteFileIfExists(imageFile.filename).catch(() => { });
          }
          return error(new ConflictError('Email sudah terdaftar'));
        }

        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        if (existingUser && (role !== 'intern' || existingUser.id !== parseInt(userId))) {
          if (imageFile?.filename) {
            const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
            await deleteFileIfExists(imageFile.filename).catch(() => { });
          }
          return error(new ConflictError('Email sudah terdaftar'));
        }
      }

      let hashedPassword = undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      if (role === 'admin') {
        const adminId = parseInt(userId);
        const existingAdmin = await prisma.admin.findUnique({
          where: { id: adminId }
        });
        if (!existingAdmin) {
          if (imageFile?.filename) {
            const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
            await deleteFileIfExists(imageFile.filename).catch(() => { });
          }
          return error(new NotFoundError('Admin tidak ditemukan'));
        }

        const updateData = {};
        if (full_name) {
          const nameParts = full_name.trim().split(/\s+/);
          updateData.nama_depan = nameParts[0];
          updateData.nama_belakang = nameParts.slice(1).join(' ') || '';
        }
        if (email) updateData.email = email;
        if (hashedPassword) updateData.password = hashedPassword;
        if (professional_bio !== undefined) updateData.professional_bio = professional_bio;

        if (imageFile) {
          const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
          const imagePath = imageUploadHelper.uploadImage(imageFile);
          updateData.profile_picture = imagePath;

          if (existingAdmin.profile_picture) {
            const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
            const path = require('path');
            const oldFileName = path.basename(existingAdmin.profile_picture);
            await deleteFileIfExists(oldFileName).catch(() => { });
          }
        }

        const updatedAdmin = await prisma.admin.update({
          where: { id: adminId },
          data: updateData
        });

        const { password: _, ...adminWithoutPassword } = updatedAdmin;
        return data({
          ...adminWithoutPassword,
          role: 'admin'
        });

      } else if (role === 'intern') {
        if (imageFile) {
          const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
          await deleteFileIfExists(imageFile.filename).catch(() => { });
          return error(new ForbiddenError('Hanya admin yang dapat mengupload foto profil'));
        }

        const internId = parseInt(userId);
        const existingUser = await prisma.user.findUnique({
          where: { id: internId }
        });
        if (!existingUser) {
          return error(new NotFoundError('User tidak ditemukan'));
        }

        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (email) updateData.email = email;
        if (hashedPassword) updateData.password = hashedPassword;
        if (professional_bio !== undefined) updateData.professional_bio = professional_bio;

        const updatedUser = await prisma.user.update({
          where: { id: internId },
          data: updateData,
          include: {
            lamaran_magang: {
              include: {
                lowongan_magang: {
                  select: {
                    posisi: true,
                    kelompok_peminatan: true
                  }
                }
              }
            }
          }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return data(userWithoutPassword);
      } else {
        if (imageFile?.filename) {
          const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
          await deleteFileIfExists(imageFile.filename).catch(() => { });
        }
        return error(new NotFoundError('Role tidak valid'));
      }
    } catch (err) {
      if (imageFile?.filename) {
        try {
          const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
          await deleteFileIfExists(imageFile.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup file:', cleanupErr);
        }
      }
      return error(err);
    }
  }
}

module.exports = new AuthService();
