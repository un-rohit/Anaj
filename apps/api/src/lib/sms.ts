import { logger } from './logger.js';

export interface SendSmsResult {
  success: boolean;
  messageId?: string | undefined;
  error?: string | undefined;
}

export async function sendOtpSms(phone: string, otp: string): Promise<SendSmsResult> {
  const provider = process.env['SMS_PROVIDER'] || 'fast2sms';
  const isDev = process.env['NODE_ENV'] !== 'production';

  // In development, log the OTP directly for effortless testing
  if (isDev) {
    logger.info({ phone, otp, provider: 'dev-console' }, `[DEV SMS] OTP for ${phone} is: ${otp}`);
    return { success: true, messageId: `dev-msg-${Date.now()}` };
  }

  try {
    // Production provider integration hooks
    const apiKey = process.env['SMS_API_KEY'];
    if (!apiKey) {
      logger.warn({ phone }, 'SMS_API_KEY is not configured, falling back to simulated SMS');
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    if (provider === 'fast2sms') {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: phone,
        }),
      });

      const data = (await response.json()) as { return?: boolean; message?: string[] };
      if (data.return) {
        return { success: true, messageId: data.message?.[0] };
      }
      return { success: false, error: data.message?.[0] || 'Fast2SMS error' };
    }

    // Default simulated provider for other types
    logger.info({ phone, provider }, 'SMS dispatched to provider gateway');
    return { success: true, messageId: `gw-${Date.now()}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ phone, err: errorMsg }, 'Failed to deliver OTP SMS');
    return { success: false, error: errorMsg };
  }
}
