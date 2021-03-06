import * as os from 'os';
const domain = process.env.domain || "gaiaform.io";

export default {
  domain,
  noreply: process.env.noreply || `Gaia Project <no-reply@${domain}>`,
  contact: process.env.contact || `contact@${domain}`,
  title: process.env.title || 'Gaia Project',
  inviteOnly: process.env.inviteOnly || false,
  minPasswordLength: process.env.minPasswordLength || 6,
  sessionSecret: process.env.sessionSecret || 'Quel est donc le secret mystère du succès de Gaia Project?!',
  port: +process.env.port || 50801,
  chatPort: +process.env.chatPort || 50802,
  dbUrl: process.env.dbUrl || 'mongodb://localhost:27017/admin',
  nodebb: "mongodb://nodebb:NodeBBPassword@localhost:27017/nodebb",
  isProduction: process.env.NODE_ENV === 'production',
  threads: process.env.threads || os.cpus().length,
  /** Is the computer able to send emails? If not, let the main server send the emails */
  automatedEmails: process.env.automatedEmails || false,
  useMailgun: !!process.env.useMailgun,
  mailgunApiKey: process.env.mailgunApiKey || 'default-mailgun-api-key',
  mailgunHost: process.env.mailgunHost || 'api.eu.mailgun.net',
  emailDomain: process.env.emailDomain || `mg-eu.${domain}`,
  newsletterDomain: process.env.newsletterDomain || `newsletter.${domain}`
};
