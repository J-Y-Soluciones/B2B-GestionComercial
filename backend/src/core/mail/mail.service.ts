// backend/src/core/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey = process.env['BREVO_API_KEY'];
  private readonly fromEmail =
    process.env['MAIL_FROM_EMAIL'] || 'soporte@vortexyolti.com';
  private readonly fromName =
    process.env['MAIL_FROM_NAME'] || 'VortexYolTI Soporte';
  private readonly frontendUrl =
    process.env['FRONTEND_URL'] || 'http://localhost:4200';

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    // Si no se ha configurado la API Key de Brevo en entorno local, emitir advertencia en consola
    if (!this.apiKey || this.apiKey.includes('tu-api-key')) {
      this.logger.warn(
        `[BREVO MOCK] No hay BREVO_API_KEY configurada. URL de recuperación para ${email}: ${resetUrl}`,
      );
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
          .header { font-size: 11px; font-family: monospace; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 8px; margin-bottom: 12px; }
          .text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #065f46; color: #ffffff !important; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; }
          .footer { margin-top: 32px; pt-16 border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; font-family: monospace; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">SEGURIDAD &bull; VORTEXYOLTI</div>
          <h1 class="title">Recuperación de Contraseña</h1>
          <p class="text">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para continuar:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" class="btn">Restablecer mi contraseña &rarr;</a>
          </div>
          <p class="text" style="font-size: 12px; color: #64748b;">Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <div class="footer">VortexYolTI Core Engine</div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email }],
          subject: 'Restablecimiento de Contraseña - VortexYolTI',
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(
          `Error al enviar correo vía Brevo: ${JSON.stringify(errorData)}`,
        );
        throw new Error('Fallo al conectar con el proveedor de correos.');
      }

      this.logger.log(
        `Correo de restablecimiento enviado exitosamente a: ${email}`,
      );
    } catch (error) {
      this.logger.error(`Excepción al enviar email de recuperación: ${error}`);
      throw error;
    }
  }
}
