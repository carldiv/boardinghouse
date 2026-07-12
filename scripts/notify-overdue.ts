import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from workspace root if it exists
try {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}...`);
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[match[1]] = value.trim();
      }
    });
  }
} catch (err: any) {
  console.warn("Could not load .env.local file automatically:", err.message);
}

// Dynamically import the core logic after env setup
async function run() {
  console.log("Checking for overdue rent payments...");
  
  // Verify required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.");
    process.exit(1);
  }

  if (!gmailUser || !gmailPass) {
    console.error("❌ Error: GMAIL_USER and GMAIL_PASS must be defined to send email notifications.");
    process.exit(1);
  }

  try {
    // We import notifyOverdueTenants here to ensure process.env variables are loaded first
    const { notifyOverdueTenants } = await import("../lib/notify-overdue");
    const report = await notifyOverdueTenants();

    console.log("\n--- Notification Run Summary ---");
    console.log(`Total Emails Sent successfully: ${report.successCount}`);
    console.log("\nDetailed results:");
    report.results.forEach((r) => {
      const statusIcon = r.status === "success" ? "✅" : r.status === "skipped" ? "ℹ️" : "❌";
      console.log(`${statusIcon} ${r.tenantName} (${r.email}) - Status: ${r.status}${r.message ? ` - Reason: ${r.message}` : ""}`);
    });
    
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Execution failed:", err.message || err);
    process.exit(1);
  }
}

run();
