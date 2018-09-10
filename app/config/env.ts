import * as os from 'os';
const domain = process.env.domain || "gaiaform.io";

export default {
  domain,
  noreply: process.env.noreply || `Gaia Project <no-reply@${domain}>`,
  contact: process.env.contact || `Gaia Project <contact@${domain}>`,
  title: process.env.title || 'Gaia Project',
  minPasswordLength: process.env.minPasswordLength || 6,
  sessionSecret: process.env.sessionSecret || 'Quel est donc le secret mystère du succès de Gaia Project?!',
  port: +process.env.port || 50801,
  chatPort: +process.env.chatPort || 50802,
  dbUrl: process.env.dbUrl || 'mongodb://gaiaAdmin:This-is-GP-RZ_COYO_508_password!@gaiaform.io:27017/admin',
  isProduction: process.env.NODE_ENV === 'production',
  threads: process.env.threads || os.cpus().length,
  /** Is the computer able to send emails? If not, let the main server send the emails */
  automatedEmails: process.env.automatedEmails || false
};
