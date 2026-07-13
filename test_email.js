const nodemailer = require("nodemailer");
const fs = require("fs");

const envLines = fs.readFileSync(".env.local", "utf8").split("\n");
let user = "";
let pass = "";
for (const line of envLines) {
  if (line.startsWith("GMAIL_USER=")) user = line.split("=")[1].trim().replace(/"/g, "");
  if (line.startsWith("GMAIL_PASS=")) pass = line.split("=")[1].trim().replace(/"/g, "");
}

if (!user || !pass) {
  console.error("Missing GMAIL_USER or GMAIL_PASS environment variables.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

const tenantName = "Test Account";
const room = "101";
const monthLabel = "July 2026";
const amountFormatted = "₱1,000.00";
const ref_number = "123456789";
const dateFormatted = new Date().toLocaleDateString("en-PH", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Manila",
});
const remainingFormatted = "₱500.00";

let remainingBalanceHtml = `
      <tr>
        <td style="color: #64748b; padding: 12px 0 6px 0; border-top: 1px solid #e2e8f0;">Remaining Balance</td>
        <td style="font-weight: 700; text-align: right; padding: 12px 0 6px 0; color: #ef4444; border-top: 1px solid #e2e8f0;">${remainingFormatted}</td>
      </tr>
`;

const appUrl = "https://boardinghouse.vercel.app";

const subject = `✅ Rent Payment Confirmed — Room ${room}`;
const text = `Hi ${tenantName},\n\nYour rent payment of ${amountFormatted} for ${monthLabel} has been confirmed!\n\nThank you for your payment.`;
const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="background-color: #dcfce7; color: #22c55e; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; line-height: 48px;">✓</div>
    </div>
    
    <h2 style="color: #0f172a; margin-top: 0; text-align: center; font-size: 20px; font-weight: 700;">Payment Confirmed</h2>
    <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-top: 16px;">Hi <strong>${tenantName}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.5; color: #475569;">Your rent payment has been successfully confirmed.</p>
    
    <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Room</td>
          <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${room}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Month</td>
          <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${monthLabel}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Amount Paid</td>
          <td style="font-weight: 700; text-align: right; padding: 6px 0; color: #22c55e;">${amountFormatted}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Ref Number</td>
          <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${ref_number}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Date</td>
          <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${dateFormatted}</td>
        </tr>${remainingBalanceHtml}
      </table>
    </div>

    <p style="font-size: 14px; line-height: 1.5; color: #475569; text-align: center; margin: 20px 0;">Thank you for your payment!</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Go to Dashboard</a>
    </div>
  </div>
`;

transporter.sendMail({
  from: `"Boarding House Manager" <${user}>`,
  to: "showtekcarl@gmail.com",
  subject,
  text,
  html,
}).then(() => {
  console.log("Email sent successfully!");
}).catch(console.error);
