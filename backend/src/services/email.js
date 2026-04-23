const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><style>
  body{font-family:Georgia,serif;background:#F5EDD8;margin:0;padding:0;}
  .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
  .header{background:linear-gradient(135deg,#3D2B1F,#5C3D2E);padding:40px;text-align:center;}
  .header h1{font-family:Georgia,serif;color:#C9A84C;font-size:1.8rem;margin:0;}
  .header p{color:rgba(245,237,216,0.7);font-size:0.85rem;margin:8px 0 0;}
  .body{padding:40px;color:#3D2B1F;line-height:1.8;}
  .body h2{color:#3D2B1F;}
  .btn{display:inline-block;background:linear-gradient(135deg,#C9A84C,#8B6914);color:#3D2B1F;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:700;margin:20px 0;}
  .footer{background:#3D2B1F;padding:24px;text-align:center;color:rgba(245,237,216,0.5);font-size:0.8rem;}
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🌿 Nkenkak-Ngiesang</h1>
    <p>Village Community Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">© ${new Date().getFullYear()} Nkenkak-Ngiesang Village Community · Cameroon</div>
</div>
</body></html>`;

exports.sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER) {
    console.log('[EMAIL STUB]', { to, subject });
    return;
  }
  await transporter.sendMail({
    from: `"Nkenkak-Ngiesang" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html: baseTemplate(html),
    text,
  });
};
