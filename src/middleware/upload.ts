import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
	destination: (_req, file, cb) => {
		let folder = 'uploads/';
		if (file.fieldname === 'cv' || file.fieldname === 'portofolio') {
			folder += 'docs/';
		} else {
			folder += 'images/';
		}

		fs.mkdirSync(folder, { recursive: true });
		cb(null, folder);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	}
});

const fileFilter = (_req: any, file: any, cb: any) => {
	if (file.fieldname === 'cv' || file.fieldname === 'portofolio') {
		if (file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			cb(new Error('CV dan Portofolio harus dalam format PDF!'), false);
		}
	} else {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('File upload harus berupa gambar!'), false);
		}
	}
};

export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // Maksimal 10MB yaa, nanti paling bisa diganti oleh admin melalui website
	}
});
