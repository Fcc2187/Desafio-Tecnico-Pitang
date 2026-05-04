import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const tmpFolder = path.resolve(__dirname, '..', '..', 'uploads');
const uploadConfig = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: process.env.NODE_ENV === 'test' ? path.join(tmpFolder, 'tests') : tmpFolder,
    filename(_request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

export default uploadConfig;
