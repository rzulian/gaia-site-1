const domain = process.env.domain || "gaiaform.io";

export default {
  domain,
  noreply: process.env.noreply || `Gaia Project <no-reply@${domain}>`,
  title: process.env.title || 'Gaia Project',
  minPasswordLength: process.env.minPasswordLength || 6,
  sessionSecret: process.env.sessionSecret || 'Quel est donc le secret mystère du succès de Gaia Project?!',
  port: +process.env.port || 50801,
  dbUrl: process.env.dbUrl || 'mongodb://gaiaAdmin:This-is-GP-RZ_COYO_508_password!@www.gaiaform.io:27017/admin'
};
