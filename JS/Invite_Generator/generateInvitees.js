const { createClient } = require("@supabase/supabase-js");
const QRCode = require("qrcode");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");



const SUPABASE_URL = "https://wkdgilnczddiyibwmlyz.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGdpbG5jemRkaXlpYndtbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTc2NjIsImV4cCI6MjA4NDM5MzY2Mn0.pL05Ugw56GiOKROtu0Az4te0qwc0SD6D5bZJVd8YmHQ";


const BASE_URL = "https://matthewcairns15.github.io/WeddingInviteApp/?code=";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generate() {

  // Load all RSVP rows
  const { data: rsvps } = await supabase
    .from("RSVP")
    .select("*");

  for (const rsvp of rsvps) {

    const inviteCode = rsvp.invite_code;

    // Load guests belonging to this RSVP
   const { data: guests, error: guestError } = await supabase
  .from("Wedding_Guest_Options")
  .select("Guest_Name")
  .eq("rsvp_id", rsvp.id);

    if (guestError) {
    console.error("Guest load error:", guestError);
    continue; // skip this invite safely
    }

    const guestList = guests || [];
    const names = guestList.map(g => g.Guest_Name).join(" & ");


    // Generate QR code buffer
    const qrBuffer = await QRCode.toBuffer(BASE_URL + inviteCode);

    // Load template image
    const template = await loadImage("template.jpg");

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0);



    // Load QR image
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 500, 1300, 150, 150);

    // Write names

    ctx.fillStyle = "#3f6b2f";
    ctx.textAlign = "center";

    drawFittedText(
    ctx,
    names,
    template.width - 200,
    template.width / 2,
    180
    );

    // Save invite

    const fs = require("fs");
    const path = require("path");

    // Convert names to safe filename text
    function safeName(str) {
        return str
            .replace(/[^a-z0-9]/gi, "_")   // replace spaces & symbols
            .toLowerCase();
    }   


    const outNames = guests.map(g => g.Guest_Name).join("_and_");

    const fileName = `${safeName(outNames)}_${inviteCode}.png`;

    const outputDir = path.join(__dirname, "generatedInvites");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const out = fs.createWriteStream(
    path.join(outputDir, fileName)
    );

 
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    await new Promise(resolve => out.on("finish", resolve));
  }
  console.log("Invitations generated");
}



function drawFittedText(ctx, text, maxWidth, x, y) {
  let fontSize = 90;
  do {
    ctx.font = `bold ${fontSize}px 'Great Vibes', 'Brush Script MT', cursive`;
    fontSize--;
  } while (ctx.measureText(text).width > maxWidth && fontSize > 30);

  ctx.fillText(text, x, y);
}



generate();
