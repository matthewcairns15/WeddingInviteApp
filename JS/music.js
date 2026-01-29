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

  if (!rsvp || !rsvp.rsvp_id) {
    alert("RSVP ID missing — cannot save");
    return;
  }

  const rsvpId = rsvp.rsvp_id;

  /* ===========================
     1️⃣ UPDATE GUEST OPTIONS
     =========================== */

  // Delete existing guests for this RSVP
  const { error: deleteGuestsError } = await supabaseClient
    .from("Wedding_Guest_Options")
    .delete()
    .eq("rsvp_id", rsvpId);

  if (deleteGuestsError) {
    console.error("Delete guests error:", deleteGuestsError);
    alert("Failed to update guests");
    return;
  }

  // Reinsert guests
  const guestsPayload = rsvp.invitees.map(inv => ({
    rsvp_id: rsvpId,
    Guest_Name: inv.name,
    Guest_Attending: inv.attending,
    Guest_Food_Choice: inv.food_choice,
    Guest_Drink_Choice: inv.drink_choice,
    Guest_Dietry_Restrictions: inv.dietry_Restrictions,
    Guest_Allergies: inv.Allergies,
    Guest_Notes: inv.notes
  }));

  if (guestsPayload.length > 0) {
    const { error: insertGuestsError } = await supabaseClient
      .from("Wedding_Guest_Options")
      .insert(guestsPayload);

    if (insertGuestsError) {
      console.error("Insert guests error:", insertGuestsError);
      alert("Failed to save guests");
      return;
    }
  }

  /* ===========================
     2️⃣ UPDATE MUSIC REQUESTS
     =========================== */

  // Delete existing music for this RSVP
  const { error: deleteMusicError } = await supabaseClient
    .from("Music_Requests")
    .delete()
    .eq("rsvp_id", rsvpId);

  if (deleteMusicError) {
    console.error("Delete music error:", deleteMusicError);
    alert("Failed to update music");
    return;
  }

  // Reinsert music
  if (Array.isArray(rsvp.song_requests) && rsvp.song_requests.length > 0) {
    const musicPayload = rsvp.song_requests.map(song => ({
      rsvp_id: rsvpId,
      songs: song
    }));

    const { error: insertMusicError } = await supabaseClient
      .from("Music_Requests")
      .insert(musicPayload);

    if (insertMusicError) {
      console.error("Insert music error:", insertMusicError);
      alert("Failed to save music");
      return;
    }
  }

  console.log("✅ RSVP updated successfully!");
}





document.getElementById("btnSubmitDB").addEventListener("click", () => {
  sendToDB();


});

document.getElementById("btnFinish").addEventListener("click", () => {
    //TODO
    //Push options to the Database

  
  sendToDB();
  // Optionally redirect to a confirmation page
  window.location.href = "./hotel.HTML";
});
