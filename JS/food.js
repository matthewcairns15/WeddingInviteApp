// Get RSVP data from localStorage
const savedRSVP = JSON.parse(localStorage.getItem("weddingRSVP"));

// Filter only attending invitees
const attendingInvitees = savedRSVP.invitees.filter(inv => inv.attending === true);

// Reference to container
const container = document.getElementById("foodContainer");

// Menu options
const menuOptions = ["Chicken", "Beef", "Vegetarian"];
const drinkOptions = ["Wine", "Beer", "Juice"];

const childMenuOptions = ["Chicken nuggets","pizza","fishfingers"];
const childDrinkOptions = ["apple juice", "Orange Juice", "fizzy drink"];



// Dynamically create dropdown for each attending invitee
attendingInvitees.forEach((invitee, index) => {
  const div = document.createElement("div");
  div.classList.add("invitee");

  const label = document.createElement("label");
  label.textContent = invitee.name;

 let select = document.createElement("select");

if (invitee.isChild) {
  select.innerHTML =
    `<option value="">--Select a menu--</option>` +
    childMenuOptions.map(opt =>
      `<option value="${opt}" ${invitee.food_choice === opt ? "selected" : ""}>${opt}</option>`
    ).join("");
} else {
  select.innerHTML =
    `<option value="">--Select a menu--</option>` +
    menuOptions.map(opt =>
      `<option value="${opt}" ${invitee.food_choice === opt ? "selected" : ""}>${opt}</option>`
    ).join("");
}

// Update RSVP object on change
select.addEventListener("change", (e) => {
  invitee.food_choice = e.target.value;
});



  div.appendChild(label);
  div.appendChild(select);

  // Drink dropdown
  const drinkLabel = document.createElement("label");
  drinkLabel.textContent = "Drink choice";
  div.appendChild(drinkLabel);

  if (invitee.isChild) {

    const drinkSelect = document.createElement("select");
    drinkSelect.innerHTML =
      `<option value="">-- Select drink --</option>` +
      childDrinkOptions.map(opt =>
        `<option value="${opt}" ${invitee.drink_choice === opt ? "selected" : ""}>${opt}</option>`
      ).join("");
    drinkSelect.onchange = e => invitee.drink_choice = e.target.value;
    div.appendChild(drinkSelect);
  }
  else{
        const drinkSelect = document.createElement("select");
    drinkSelect.innerHTML =
      `<option value="">-- Select drink --</option>` +
      drinkOptions.map(opt =>
        `<option value="${opt}" ${invitee.drink_choice === opt ? "selected" : ""}>${opt}</option>`
      ).join("");
    drinkSelect.onchange = e => invitee.drink_choice = e.target.value;
    div.appendChild(drinkSelect);
  }

  // Dietary restrictions input
  const dietaryLabel = document.createElement("label");
  dietaryLabel.textContent = "Dietary restrictions (optional):";
  div.appendChild(dietaryLabel);

  const dietaryInput = document.createElement("input");
  dietaryInput.type = "text";
  dietaryInput.placeholder = "e.g., gluten-free, vegetarian";
  dietaryInput.value = invitee.dietary_restrictions || "";
  dietaryInput.addEventListener("input", (e) => {
    invitee.dietary_restrictions = e.target.value;
  });
  div.appendChild(dietaryInput);

  // Allergies input
  const allergyLabel = document.createElement("label");
  allergyLabel.textContent = "Allergies (optional):";
  div.appendChild(allergyLabel);

  const allergyInput = document.createElement("input");
  allergyInput.type = "text";
  allergyInput.placeholder = "e.g., nuts, shellfish";
  allergyInput.value = invitee.allergies || "";
  allergyInput.addEventListener("input", (e) => {
    invitee.allergies = e.target.value;
  });
  div.appendChild(allergyInput);


  container.appendChild(div);
});

// Submit button handler
document.getElementById("submitFood").addEventListener("click", () => {
  // Check all attending invitees have selected a menu
  const unanswered = attendingInvitees.some(inv => !inv.food_choice);
  if (unanswered) {
    alert("Please select a menu for everyone attending.");
    return;
  }

  // Update localStorage
  localStorage.setItem("weddingRSVP", JSON.stringify(savedRSVP));
  alert("Food choices saved!");

  // Optionally redirect to a confirmation page
  goToPage("music.html");
});

function goToPage(page) {
  window.location.href = `/WeddingInviteApp/${page}`;
}
