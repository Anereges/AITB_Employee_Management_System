const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.fullName?.split(' ')[0] || 'User';
    this.url = url || '';
    this.from = 'Employee Management <no-reply@employeeapp.com>';
  }

  async newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Production transport (configure later when needed)
      throw new Error('Production email transport not configured');
    }

    // Development: Use Ethereal
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  async send(subject, html) {
    try {
      const transporter = await this.newTransport();
      const info = await transporter.sendMail({
        from: this.from,
        to: this.to,
        subject,
        html
      });

      console.log('Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error('Email sending error (but registration continues):', err.message);
      // Fail silently in development
    }
  }

  async sendRegistrationConfirmation() {
    await this.send(
      'Welcome to Employee Management',
      `<h1>Welcome, ${this.firstName}!</h1>
       <p>Your account was registered successfully.</p>
       <p>Please wait for admin approval.</p>`
    );
  }
}

module.exports = Email;