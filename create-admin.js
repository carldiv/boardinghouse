/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local from the workspace root
const envPath = "c:/Users/U S E R - P C/Documents/boardinghouse/.env.local";
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("❌ Usage error!");
  console.log("Please run as: node create-admin.js <email> <password>");
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function run() {
  console.log(`Creating admin account for ${email}...`);
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin" },
  });

  if (error) {
    console.error("❌ Failed to create admin:", error.message);
  } else {
    console.log("✅ Admin user created successfully with metadata role='admin'!");
    console.log("User UID:", data.user.id);
  }
}

run();
