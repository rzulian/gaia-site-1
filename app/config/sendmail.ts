import env from './env';

const apiKey = env.mailgunApiKey;
const domain = env.emailDomain;

import * as Mailgun from 'mailgun-js';

const mailgun = Mailgun({apiKey, domain});

const sendmail = data => mailgun.messages().send(data);

export default sendmail;