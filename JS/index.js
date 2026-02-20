// ===== Invitee class =====
class Invitee {
   constructor(name) {
    this.name = name;
    this.attending = null;
    this.starter_choice = null;
    this.main_choice = null;
    this.dessert_choice = null;
    this.drink_choice = null;
    this.dietary_restrictions = null;  // fixed spelling
    this.allergies = null;             // lowercase for consistency
    this.Music = null;
    this.notes = null;
    this.isChild = false;
  }

  setAttending(value) {
    this.attending = value;
  }
}

// ===== WeddingRSVP class =====
class WeddingRSVP {
  constructor(inviteCode) {
    this.inviteCode = inviteCode;
    this.invitees = [];
    this.rsvp_id = null;
  }

  addInvitee(name) {
    this.invitees.push(new Invitee(name));
  }

  setAttendance(index, attending) {
    if (this.invitees[index]) {
      this.invitees[index].setAttending(attending);
    }
  }
}

//Main()

let rsvp;

(async function main() {
  const inviteCode = await get_invite_code();
  if (!inviteCode) return;

  rsvp = new WeddingRSVP(inviteCode);
  await get_invitee_names(rsvp);

  renderInvitees();
})();




// ===== Render Invitees Dynamically =====
function renderInvitees() {
  const container = document.getElementById("invitee-names");
  container.innerHTML = ""; // clear container

  rsvp.invitees.forEach((invitee, index) => {
    const div = document.createElement("div");
    div.classList.add("invitee");

    // Label for name
    const label = document.createElement("label");
    label.textContent = invitee.name;
    label.setAttribute("for", `attendance-${index}`);

    // Dropdown select
    const select = document.createElement("select");
    select.id = `attendance-${index}`;
    select.innerHTML = `
      <option value="">--Select--</option>
      <option value="true">Attending</option>
      <option value="false">Not Attending</option>
    `;
    select.addEventListener("change", (e) => {
      const value = e.target.value === "true";
      rsvp.setAttendance(index, value);
    });

    div.appendChild(label);
    div.appendChild(select);
    container.appendChild(div);
  });
}

// ===== Save RSVP =====
function saveRSVP() {
  localStorage.setItem("weddingRSVP", JSON.stringify(rsvp));
}

// ===== Submit Handler =====
  // Attach submit button handler
  document.getElementById("submitRSVP").addEventListener("click", async () => {
  
  // Ensure all invitees have selected attendance
  const unanswered = rsvp.invitees.some(inv => inv.attending === null);

  if (unanswered) {
    alert("Please select attendance for all invitees.");
    return;
  }

  saveRSVP();

  // If all are not attending → redirect to 'Not attending' page
  const allNotAttending = rsvp.invitees.every(inv => inv.attending === false);

  const button = document.getElementById("submitRSVP");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("btnSpinner");

  // Disable + show spinner
  button.disabled = true;
  btnText.textContent = "Saving...";
  spinner.classList.remove("hidden");
 
  //Push options to the Database
  const success = await sendToDB();

  if (!success) {
    alert("Something went wrong saving your RSVP. Please try again.");

    // Restore button
    button.disabled = false;
    btnText.textContent = "Finish";
    spinner.classList.add("hidden");
    return;
  }
  // Optionally redirect to a confirmation page
  btnText.textContent = "Saved ✓";
  spinner.classList.add("hidden");




  // usage
  if (allNotAttending) {
   setTimeout(() => {
    goToPage("food.html");
    }, 800);
  } else {
    setTimeout(() => {
      goToPage("not-attending.html");
    }, 800);
  }
});

function goToPage(page) {
  window.location.href = `/WeddingInviteApp/${page}`;
}

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
    return false;
  }

  // Reinsert guests
  const guestsPayload = rsvp.invitees.map(inv => ({
    rsvp_id: rsvpId,
    Guest_Name: inv.name,
    Guest_Attending: inv.attending,
    Guest_Starter_Choice: inv.starter_choice,
    Guest_Main_Choice: inv.main_choice,
    Guest_Dessert_Choice: inv.dessert_choice,
    Guest_Drink_Choice: inv.drink_choice,
    Guest_Dietry_Restrictions: inv.dietary_restrictions,
    Guest_Allergies: inv.allergies,
    Is_Child: inv.isChild,
    Guest_Notes: inv.notes
  }));

  if (guestsPayload.length > 0) {
    const { error: insertGuestsError } = await supabaseClient
      .from("Wedding_Guest_Options")
      .insert(guestsPayload);

    if (insertGuestsError) {
      console.error("Insert guests error:", insertGuestsError);
      alert("Failed to save guests");
      return false;
    }
  }

  console.log("✅ RSVP updated successfully!");
  return true;
}

async function get_invite_code()
{
  const params = new URLSearchParams(window.location.search);
  const inviteCode = params.get("code");

  if (!inviteCode) {
    // show error / redirect
    alert("Invalid invite code");
    return;
  }
  return inviteCode;
}

async function get_invitee_names(rsvp) {
  const supabaseUrl = "https://wkdgilnczddiyibwmlyz.supabase.co";
  const supabaseAnonKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGdpbG5jemRkaXlpYndtbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTc2NjIsImV4cCI6MjA4NDM5MzY2Mn0.pL05Ugw56GiOKROtu0Az4te0qwc0SD6D5bZJVd8YmHQ";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);


  try {
    // Get RSVP ID from invite code
    const { data: rsvpData, error: rsvpError } = await supabaseClient
      .from('RSVP')
      .select('id')
      .eq('invite_code', rsvp.inviteCode)
      .single(); // get a single row

    if (rsvpError || !rsvpData) {
      alert("Invalid RSVP code");
      return;
    }

    rsvp.rsvp_id = rsvpData.id; // save RSVP ID in object

    // Fetch guest names
    const { data: guests, error: guestError } = await supabaseClient
      .from('Wedding_Guest_Options')
      .select('Guest_Name, Is_Child')
      .eq('rsvp_id', rsvp.rsvp_id)

    if (guestError) throw guestError;

    guests.forEach(row => {
      if (!row.Guest_Name) return;

      const invitee = new Invitee(row.Guest_Name);
      invitee.isChild = row.Is_Child === true;   // IMPORTANT
      rsvp.invitees.push(invitee);
    });


    console.log(`Guests for RSVP ${rsvp.inviteCode}:`, guests);
    return guests;

  } catch (err) {
    console.error('Error fetching guest names:', err.message);
    return [];
  }
}