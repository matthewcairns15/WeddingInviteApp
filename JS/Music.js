// Load RSVP data from localStorage
const savedRSVP = JSON.parse(localStorage.getItem("weddingRSVP")) || {};

// Ensure song_requests exists as an array
if (!Array.isArray(savedRSVP.song_requests)) {
  savedRSVP.song_requests = [];
}

// Reference elements
const songInput = document.getElementById("songInput");
const rsvpDisplay = document.getElementById("rsvpDisplay");

// Function to update display
function updateDisplay() {
  rsvpDisplay.textContent = JSON.stringify(
    {
      ...savedRSVP,
      song_requests: savedRSVP.song_requests.join(", ")
    },
    null,
    2
  );
}

// Initialize display
updateDisplay();

// Submit handler
document.getElementById("submitMusic").addEventListener("click", () => {
  const input = songInput.value.trim();

  if (input) {
    // Split by commas, trim whitespace, remove empty entries
    const songs = input
      .split(",")
      .map(song => song.trim())
      .filter(song => song.length > 0);

    // Append new songs
    savedRSVP.song_requests.push(...songs);

    // Save back to localStorage
    localStorage.setItem("weddingRSVP", JSON.stringify(savedRSVP));

    alert("Song request(s) saved!");
  }

  updateDisplay();
  songInput.value = "";
});



async function sendToDB() {
  const supabaseUrl = "https://wkdgilnczddiyibwmlyz.supabase.co";
  const supabaseAnonKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGdpbG5jemRkaXlpYndtbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTc2NjIsImV4cCI6MjA4NDM5MzY2Mn0.pL05Ugw56GiOKROtu0Az4te0qwc0SD6D5bZJVd8YmHQ";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const rsvp = JSON.parse(localStorage.getItem("weddingRSVP"));
  if (!rsvp || !rsvp.inviteCode) {
    alert("RSVP or invite code missing!");
    return;
  }

  // 1️⃣ Upsert RSVP
  const { data: upsertData, error: upsertError } = await supabaseClient
    .from("RSVP")
    .upsert(
      { invite_code: rsvp.inviteCode },
      { onConflict: "invite_code" }
    );

  if (upsertError) {
    console.error("RSVP upsert error:", upsertError);
    alert("Failed to save RSVP");
    return;
  }

  // 2️⃣ Fetch row to get id
  const { data: rsvpRow, error: fetchError } = await supabaseClient
    .from("RSVP")
    .select()
    .eq("invite_code", rsvp.inviteCode)
    .single();

  if (fetchError) {
    console.error("RSVP fetch error:", fetchError);
    alert("Failed to get RSVP row ID");
    return;
  }

  // 3️⃣ Insert guests
  const guestsPayload = rsvp.invitees.map(inv => ({
    rsvp_id: rsvpRow.id,
    Guest_Name: inv.name,
    Guest_Attending: inv.attending,
    Guest_Food_Choice: inv.food_choice,
    Guest_Drink_Choice: inv.drink_choice,
    Guest_Dietry_Restrictions: inv.dietary_restrictions,
    Guest_Allergies: inv.allergies,
    Guest_Notes: inv.notes
  }));

  const { error: guestsError } = await supabaseClient
    .from("Wedding_Guests_Options")
    .insert(guestsPayload);

  if (guestsError) {
    console.error("Guests error:", guestsError);
    alert("Failed to save guests");
    return;
  }

  // 4️⃣ Insert music requests
  if (Array.isArray(rsvp.song_requests) && rsvp.song_requests.length > 0) {
    const musicPayload = rsvp.song_requests.map(song => ({
      rsvp_id: rsvpRow.id,
      song_name: song
    }));

    const { error: musicError } = await supabaseClient
      .from("Music_Requests")
      .insert(musicPayload);

    if (musicError) {
      console.error("Music error:", musicError);
      alert("Failed to save music requests");
      return;
    }
  }

  console.log("✅ RSVP fully saved!");
}




document.getElementById("btnSubmitDB").addEventListener("click", () => {
  sendToDB();


});

document.getElementById("btnFinish").addEventListener("click", () => {
    //TODO
    //Push options to the Database

  
  sendToDB();
  // Optionally redirect to a confirmation page
  window.location.href = "./Hotel.HTML";
});
