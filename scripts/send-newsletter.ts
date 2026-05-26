import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const POST_TITLE = process.argv[2];
const POST_URL = process.argv[3];

if (!POST_TITLE || !POST_URL) {
  console.error(
    "Usage: tsx scripts/send-newsletter.ts <post-title> <post-url>"
  );
  process.exit(1);
}

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY || !SITE_URL) {
  console.error("Missing required env vars: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, SITE_URL");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const { data: subscribers, error } = await supabase
  .from("subscribers")
  .select("email, token")
  .is("unsubscribed_at", null);

if (error) {
  console.error("Failed to fetch subscribers:", error.message);
  process.exit(1);
}

for (const subscriber of subscribers ?? []) {
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${subscriber.token}`;

  try {
    await resend.emails.send({
      from: "jacobsidian <noreply@jacobsidian.com>",
      to: subscriber.email,
      subject: `새 글: ${POST_TITLE}`,
      html: `
      <p>새 글이 올라왔습니다.</p>
      <p><a href="${POST_URL}">${POST_TITLE}</a></p>
      <hr />
      <p style="font-size: 12px; color: #888;">
        <a href="${unsubscribeUrl}">구독 해지</a>
      </p>
    `,
    });
    console.log(`sent to ${subscriber.email}`);
  } catch (err) {
    console.error(`failed to send to ${subscriber.email}:`, err);
  }
}
