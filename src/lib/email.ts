import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

// ─── KOVA Brand Colors ──────────────────────────────────────────────
const KOVA = {
  midnight: '#0D1B2A',
  cobalt: '#1E3A5F',
  emerald: '#10B981',
  gold: '#F59E0B',
  arctic: '#F8FAFC',
  muted: '#64748B',
};

// ─── Base KOVA Email Template ───────────────────────────────────────
function kovaEmailTemplate({
  title,
  preheader,
  body,
  ctaLabel,
  ctaUrl,
  footerNote,
}: {
  title: string;
  preheader: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background: ${KOVA.arctic}; color: ${KOVA.midnight}; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(13,27,42,0.08); }
    .header { background: linear-gradient(135deg, ${KOVA.midnight} 0%, ${KOVA.cobalt} 100%); padding: 32px 40px; }
    .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, ${KOVA.emerald}, ${KOVA.cobalt}); display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.04em; }
    .logo-sub { font-size: 9px; font-weight: 700; color: ${KOVA.gold}; text-transform: uppercase; letter-spacing: 0.15em; line-height: 1; }
    .header-title { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3; }
    .header-sub { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; }
    .body { padding: 40px; }
    .body p { font-size: 14px; line-height: 1.7; color: ${KOVA.muted}; margin-bottom: 16px; }
    .amount-block { background: ${KOVA.arctic}; border-radius: 14px; padding: 20px 24px; margin: 24px 0; border-left: 4px solid ${KOVA.emerald}; }
    .amount-label { font-size: 9px; font-weight: 900; color: ${KOVA.muted}; text-transform: uppercase; letter-spacing: 0.15em; }
    .amount-value { font-size: 28px; font-weight: 900; color: ${KOVA.midnight}; letter-spacing: -0.04em; margin-top: 4px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
    .badge-success { background: rgba(16,185,129,0.1); color: ${KOVA.emerald}; }
    .badge-warning { background: rgba(245,158,11,0.1); color: ${KOVA.gold}; }
    .badge-danger { background: rgba(239,68,68,0.1); color: #EF4444; }
    .cta { display: block; text-align: center; background: ${KOVA.midnight}; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; margin: 24px 0; }
    .divider { height: 1px; background: ${KOVA.arctic}; margin: 24px 0; }
    .footer { padding: 24px 40px; background: ${KOVA.arctic}; border-top: 1px solid #E2E8F0; }
    .footer p { font-size: 11px; color: ${KOVA.muted}; line-height: 1.6; }
    .footer strong { color: ${KOVA.midnight}; }
  </style>
</head>
<body>
  <!-- Preheader (hidden) -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

  <div class="wrapper">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="logo-row">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 4v16M6 12l8-8M6 12l8 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div class="logo-text">KOVA</div>
          </div>
        </div>
        <div class="header-sub">Notification</div>
        <div class="header-title">${title}</div>
      </div>

      <!-- Body -->
      <div class="body">
        ${body}
        ${ctaLabel && ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaLabel}</a>` : ''}
        <div class="divider"></div>
        <p style="font-size:11px;color:#94A3B8;">This is an automated notification from KOVA. Please do not reply to this email.</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>KOVA</strong> · Co-operative Financial Platform</p>
        <p>© ${new Date().getFullYear()} KOVA. All rights reserved.</p>
        ${footerNote ? `<p style="margin-top:8px;color:#94A3B8;">${footerNote}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Core Sender ────────────────────────────────────────────────────
export const sendNotificationEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: 'KOVA <notifications@phinec-coop.com>',
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('KOVA Email sending failed:', error);
    return { success: false, error };
  }
};

// ─── Named Email Helpers ────────────────────────────────────────────

export const sendContributionVerifiedEmail = async (
  to: string,
  name: string,
  amount: number,
  status: 'CONFIRMED' | 'REJECTED'
) => {
  const isApproved = status === 'CONFIRMED';
  return sendNotificationEmail({
    to,
    subject: `KOVA: Contribution ${isApproved ? 'Confirmed' : 'Rejected'} — ₦${amount.toLocaleString()}`,
    html: kovaEmailTemplate({
      title: `Contribution ${isApproved ? 'Confirmed ✓' : 'Rejected'}`,
      preheader: `Your contribution of ₦${amount.toLocaleString()} has been ${isApproved ? 'confirmed' : 'rejected'}.`,
      body: `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your monthly contribution payment has been reviewed by the KOVA secretary.</p>
        <div class="amount-block">
          <div class="amount-label">Contribution Amount</div>
          <div class="amount-value">₦${amount.toLocaleString()}</div>
        </div>
        <p>Status: <span class="status-badge ${isApproved ? 'badge-success' : 'badge-danger'}">${isApproved ? 'Confirmed' : 'Rejected'}</span></p>
        ${!isApproved ? '<p>If you believe this is an error, please contact the KOVA secretary with your payment receipt.</p>' : '<p>Your contribution has been recorded to your savings account.</p>'}
      `,
    }),
  });
};

export const sendLoanStatusEmail = async (
  to: string,
  name: string,
  amount: number,
  status: 'APPROVED' | 'REJECTED',
  totalRepayment?: number
) => {
  const isApproved = status === 'APPROVED';
  return sendNotificationEmail({
    to,
    subject: `KOVA: Loan Application ${isApproved ? 'Approved' : 'Rejected'} — ₦${amount.toLocaleString()}`,
    html: kovaEmailTemplate({
      title: `Loan Application ${isApproved ? 'Approved ✓' : 'Rejected'}`,
      preheader: `Your loan request of ₦${amount.toLocaleString()} has been ${isApproved ? 'approved' : 'rejected'}.`,
      body: `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your loan application has been reviewed by the KOVA credit committee.</p>
        <div class="amount-block">
          <div class="amount-label">Principal Amount</div>
          <div class="amount-value">₦${amount.toLocaleString()}</div>
          ${isApproved && totalRepayment ? `<div class="amount-label" style="margin-top:12px;">Total Repayment (incl. interest)</div><div style="font-size:16px;font-weight:900;color:#F59E0B;margin-top:4px;">₦${totalRepayment.toLocaleString()}</div>` : ''}
        </div>
        <p>Status: <span class="status-badge ${isApproved ? 'badge-success' : 'badge-danger'}">${isApproved ? 'Approved' : 'Rejected'}</span></p>
        ${isApproved ? '<p>Your loan will be disbursed per the cooperative schedule. Please ensure timely monthly repayments to maintain your credit standing.</p>' : '<p>Please contact the KOVA admin for further information on your application.</p>'}
      `,
    }),
  });
};

export const sendRepaymentVerifiedEmail = async (
  to: string,
  name: string,
  amount: number,
  status: 'CONFIRMED' | 'REJECTED',
  remainingBalance?: number
) => {
  const isApproved = status === 'CONFIRMED';
  return sendNotificationEmail({
    to,
    subject: `KOVA: Repayment ${isApproved ? 'Confirmed' : 'Rejected'} — ₦${amount.toLocaleString()}`,
    html: kovaEmailTemplate({
      title: `Loan Repayment ${isApproved ? 'Confirmed ✓' : 'Rejected'}`,
      preheader: `Your repayment of ₦${amount.toLocaleString()} has been ${isApproved ? 'confirmed' : 'rejected'}.`,
      body: `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your loan repayment has been processed by the KOVA secretary.</p>
        <div class="amount-block">
          <div class="amount-label">Repayment Amount</div>
          <div class="amount-value">₦${amount.toLocaleString()}</div>
          ${isApproved && remainingBalance !== undefined ? `<div class="amount-label" style="margin-top:12px;">Remaining Balance</div><div style="font-size:16px;font-weight:900;color:#F59E0B;margin-top:4px;">₦${remainingBalance.toLocaleString()}</div>` : ''}
        </div>
        <p>Status: <span class="status-badge ${isApproved ? 'badge-success' : 'badge-danger'}">${isApproved ? 'Confirmed' : 'Rejected'}</span></p>
        ${remainingBalance === 0 && isApproved ? '<p>🎉 Congratulations! Your loan has been <strong>fully repaid</strong>. Your account is now clear.</p>' : ''}
      `,
    }),
  });
};
