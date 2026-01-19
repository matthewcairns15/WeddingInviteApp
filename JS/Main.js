// ===== Invitee class =====
class Invitee {
  constructor(name) {
    this.name = name;
    this.attending = null;
    this.food_choice = null;
    this.drink_choice = null;
    this.dietry_Restrictions = null;
    this.Allergies = null;
    this.Music = null;
    this.notes = null;
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

// ===== Create RSVP instance =====
const rsvp = new WeddingRSVP("ABC1234");

// Add invitees (replace with actual names)
rsvp.addInvitee("John");
rsvp.addInvitee("Jane");
rsvp.addInvitee("Emily");

// ===== Render Invitees Dynamically =====
function renderInvitees() {
  const container = document.getElementById("inviteesContainer");
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

  if (allNotAttending) {
    window.location.href = "not-attending.html";
  } else {
    // Otherwise, go to food selection page
    window.location.href = "food.html";
  }
}

// ===== Initialize Page =====
window.addEventListener("DOMContentLoaded", () => {
  renderInvitees();

  // Attach submit button handler
  document.getElementById("submitRSVP").addEventListener("click", submitRSVP);
});
