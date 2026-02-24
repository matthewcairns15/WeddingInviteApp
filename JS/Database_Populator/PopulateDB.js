const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { parse } = require("csv-parse/sync");


class Invitee {
   constructor(name) {
    this.name = name;
    this.inviteCode = "";
    this.isChild = false;
    this.rsvpId = 0;
  }

  setAttending(value) {
    this.attending = value;
  }
}


async function main() {
    let data = await readCSV();
    data = genInviteCodes(data);
    await sendToDB(data);
}

main();


async function readCSV() {

    const filePath = "./CSV/bridebook-guestlist-export.csv";

    const fileContent  = fs.readFileSync(filePath, "utf8");

    const records = parse(fileContent, {
            columns: true,      // automatically uses header row
            skip_empty_lines: true,
            trim: true
        });

    return records;
}

function genInviteCodes(data) {

    let invitees = [];
    let prevGroupHead = null;
    let generatedCode = null;
    let rsvpId = 0;

    data.forEach(row => {

        // Name, GroupHead, Age group = Child

        // create local struct to return the data


        const invitee = new Invitee(row.Name);
        invitee.isChild = String(row["Age group"] || "").toLowerCase() === "child"; 

        let groupHead = row["Group head"]?.trim();
        let guestName = row["Name"].trim();

        
        if (!groupHead) {
            generatedCode = generateRandomCode();
            rsvpId += 1;
            invitee.rsvpId = rsvpId;
            invitee.inviteCode = generatedCode;
            prevGroupHead = guestName;
        } else if (groupHead === prevGroupHead) {
            invitee.inviteCode = generatedCode;
            invitee.rsvpId = rsvpId;
        }
        else {
              console.log("group head error");

        }
        
        invitees.push(invitee);
    });

    return invitees;
}

function generateRandomCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

async function sendToDB(data) {


  const supabaseUrl = "https://wkdgilnczddiyibwmlyz.supabase.co";
  const supabaseAnonKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGdpbG5jemRkaXlpYndtbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTc2NjIsImV4cCI6MjA4NDM5MzY2Mn0.pL05Ugw56GiOKROtu0Az4te0qwc0SD6D5bZJVd8YmHQ";

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);


  await clearTables(supabaseClient);


  // 1️⃣ Group rows by invite_code
  const grouped = {};

  for (const row of data) {
    if (!grouped[row.inviteCode]) {
      grouped[row.inviteCode] = [];
    }
    grouped[row.inviteCode].push(row);
  }

  // 2️⃣ Loop through each invite_code group
  for (const inviteCode in grouped) {

    // Insert ONE RSVP row
    const { data: rsvpInsert, error: rsvpError } = await supabaseClient
      .from("RSVP")
      .insert([{ invite_code: inviteCode }])
      .select()
      .single();

    if (rsvpError) {
      console.error("RSVP insert error:", rsvpError);
      return;
    }

    const rsvpId = rsvpInsert.id;

    console.log(rsvpId);

    // 3️⃣ Insert all guests linked to this RSVP
    const guestsPayload = grouped[inviteCode].map(guest => ({
      rsvp_id: rsvpId,
      Guest_Name: guest.name,
      Is_Child: guest.isChild
    }));

    const { error: guestError } = await supabaseClient
      .from("Wedding_Guest_Options")
      .insert(guestsPayload);

    if (guestError) {
      console.error("Guest insert error:", guestError);
      return;
    }
  }

  console.log("Import complete");
}

async function clearTables(supabaseClient) {
  const { error } = await supabaseClient.rpc("clear_wedding_tables");

  if (error) {
    console.error("Error clearing tables:", error);
    throw error;
  }

  console.log("Tables cleared successfully");
}