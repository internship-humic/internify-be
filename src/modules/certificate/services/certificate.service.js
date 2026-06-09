const certificateRepository = require('../repositories/certificate.repository');
const { data, error } = require('../../../helpers/utils/wrapper');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../../helpers/error');

class CertificateService {
  async claimCertificate(payload, actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError('User ID is required'));
      }

      if (actor.role !== 'intern') {
        return error(
          new ForbiddenError('Access denied: only interns can claim certificates'),
        );
      }

      const { id_project } = payload;

      const existingCert = await certificateRepository.findByUserAndProject(actor.id, id_project);
      if (existingCert) {
        return error(new ConflictError('Certificate already claimed for this project'));
      }

      const projectInfo = await certificateRepository.getProjectTasksAndSubmissions(id_project, actor.id);

      if (!projectInfo) {
        return error(new NotFoundError('Project not found'));
      }

      if (!projectInfo.members || projectInfo.members.length === 0) {
        return error(
          new ForbiddenError('Access denied: you are not an active member of this project'),
        );
      }

      if (!projectInfo.tasks || projectInfo.tasks.length === 0) {
        return error(
          new BadRequestError('Cannot claim certificate: this project does not have any tasks assigned yet'),
        );
      }

      const completedTasks = projectInfo.tasks.filter(
        (task) => task.submissions && task.submissions.length > 0
      );

      if (completedTasks.length < projectInfo.tasks.length) {
        return error(
          new BadRequestError(
            `Cannot claim certificate: you have completed ${completedTasks.length} out of ${projectInfo.tasks.length} tasks`
          ),
        );
      }

      // Generate certificate number berdsarkan format ini: CERT/YYYYMMDD/PRJ{id_project}/USR{id_user} [Rafi 09/06/2026 20:45]
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${date}`;
      const certificateNo = `CERT/${dateString}/PRJ${id_project}/USR${actor.id}`;

      const certificateData = {
        id_project: parseInt(id_project),
        id_user: parseInt(actor.id),
        certificate_no: certificateNo,
        issued_at: now,
      };

      const certificate = await certificateRepository.create(certificateData);

      return data(this.mapCertificate(certificate));
    } catch (err) {
      return error(err);
    }
  }

  async getMyCertificates(actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError('User ID is required'));
      }

      if (actor.role !== 'intern') {
        return error(
          new ForbiddenError('Access denied: only interns can view their certificates'),
        );
      }

      const certificates = await certificateRepository.findUserCertificates(actor.id);
      return data(certificates.map((cert) => this.mapCertificate(cert)));
    } catch (err) {
      return error(err);
    }
  }

  async getCertificateDetail(id, actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError('User ID is required'));
      }

      const certificate = await certificateRepository.findById(id);
      if (!certificate) {
        return error(new NotFoundError('Certificate not found'));
      }

      if (actor.role === 'intern' && certificate.id_user !== actor.id) {
        return error(
          new ForbiddenError("Access denied: you cannot view other intern's certificates"),
        );
      }

      return data(this.mapCertificate(certificate));
    } catch (err) {
      return error(err);
    }
  }

  async getProjectCertificates(id_project, actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError('Admin ID is required'));
      }

      if (actor.role !== 'admin') {
        return error(
          new ForbiddenError('Access denied: only admins/mentors can view project certificates'),
        );
      }

      const certificates = await certificateRepository.findProjectCertificates(id_project);
      return data(certificates.map((cert) => this.mapCertificate(cert)));
    } catch (err) {
      return error(err);
    }
  }

  async getAllCertificates(actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError('Admin ID is required'));
      }

      if (actor.role !== 'admin') {
        return error(
          new ForbiddenError('Access denied: only admins/mentors can view all certificates'),
        );
      }

      const certificates = await certificateRepository.findAll();
      return data(certificates.map((cert) => this.mapCertificate(cert)));
    } catch (err) {
      return error(err);
    }
  }

  async verifyCertificate(certificate_no) {
    try {
      if (!certificate_no) {
        return error(new BadRequestError('Certificate number is required'));
      }

      const certificate = await certificateRepository.findByCertificateNo(certificate_no);
      if (!certificate) {
        return error(new NotFoundError('Certificate not found or invalid'));
      }

      return data(this.mapCertificate(certificate));
    } catch (err) {
      return error(err);
    }
  }

  async verifyCertificateByUuid(uuid) {
    try {
      if (!uuid) {
        return error(new BadRequestError('Certificate UUID is required'));
      }

      const certificate = await certificateRepository.findByUuid(uuid);
      if (!certificate) {
        return error(new NotFoundError('Certificate not found or invalid'));
      }

      return data({
        uuid: certificate.uuid,
        intern_name: certificate.user ? certificate.user.full_name : null,
        project_name: certificate.project ? certificate.project.project_name : null,
        created_at: certificate.issued_at,
      });
    } catch (err) {
      return error(err);
    }
  }

  mapCertificate(cert) {
    if (!cert) return null;
    return {
      id: cert.id,
      uuid: cert.uuid,
      id_project: cert.id_project,
      id_user: cert.id_user,
      certificate_no: cert.certificate_no,
      issued_at: cert.issued_at,
      user: cert.user ? {
        id: cert.user.id,
        full_name: cert.user.full_name,
        email: cert.user.email,
      } : null,
      project: cert.project ? {
        id: cert.project.id,
        project_name: cert.project.project_name,
        description: cert.project.description,
      } : null,
    };
  }
}

module.exports = new CertificateService();
