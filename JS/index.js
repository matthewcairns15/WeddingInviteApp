// ===== Invitee class =====
class Invitee {
   constructor(name) {
    this.name = name;
    this.attending = null;
    this.food_choice = null;
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

  // Attach submit button handler
  document.getElementById("submitRSVP").addEventListener("click", submitRSVP);


// ===== Render Invitees Dynamically =====
function renderInvitees() {
  const container = document.getElementById("invite-card");
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
function submitRSVP() {
  // Ensure all invitees have selected attendance
  const unanswered = rsvp.invitees.some(inv => inv.attending === null);

  if (unanswered) {
    alert("Please select attendance for all invitees.");
    return;
  }

  saveRSVP();

  // If all are not attending → redirect to 'Not attending' page
  const allNotAttending = rsvp.invitees.every(inv => inv.attending === false);

  // usage
  if (allNotAttending) {
    goToPage("not-attending.html");
  } else {
    goToPage("food.html");
  }
}

function goToPage(page) {
  window.location.href = `/WeddingInviteApp/${page}`;
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