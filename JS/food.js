// Get RSVP data from localStorage
const savedRSVP = JSON.parse(localStorage.getItem("weddingRSVP"));

// Filter only attending invitees
const attendingInvitees = savedRSVP.invitees.filter(inv => inv.attending === true);

// Reference to container
const container = document.getElementById("foodContainer");

// Menu options
const starterOptions = ["Soup", "salad", "katsu"];
const mainOptions = ["Chicken", "Beef", "Vegetarian"];
const dessertOptions = ["cake", "ice cream", "mouse"];
const drinkOptions = ["Wine", "Beer", "Juice"];

const childStarterOptions = ["child soup","child salad","child fish"];
const childMainOptions = ["Chicken nuggets","pizza","fishfingers"];
const childDessertOptions = ["cake","ice lolly","pickNMix"];


const childDrinkOptions = ["apple juice", "Orange Juice", "fizzy drink"];


container.innerHTML = ""; // clear container


// Dynamically create dropdown for each attending invitee
attendingInvitees.forEach((invitee, index) => {
  const div = document.createElement("div");
  div.classList.add("invitee");

  const label = document.createElement("label-name");
  label.textContent = invitee.name;

 let selectStarter = document.createElement("select");



  if (invitee.isChild) {
    selectStarter.innerHTML =
      `<option value="">--Select a starter--</option>` +
      childStarterOptions.map(opt =>
        `<option value="${opt}" ${invitee.starter_choice === opt ? "selected" : ""}>${opt}</option>`
      ).join("");
  } else {
    selectStarter.innerHTML =
      `<option value="">--Select a starter--</option>` +
      starterOptions.map(opt =>
        `<option value="${opt}" ${invitee.starter_choice === opt ? "selected" : ""}>${opt}</option>`
      ).join("");
  }

  // Update RSVP object on change
  selectStarter.addEventListener("change", (e) => {
    invitee.starter_choice = e.target.value;
  });

  div.appendChild(label);

     // menu dropdown
  const starterlabel = document.createElement("label");
  starterlabel.textContent = "Starter choice:";
  div.appendChild(starterlabel);

  div.appendChild(selectStarter);


  //main
  let selectMain = document.createElement("select");

  if (invitee.isChild) {
      selectMain.innerHTML =
        `<option value="">--Select a main--</option>` +
        childMainOptions.map(opt =>
          `<option value="${opt}" ${invitee.main_choice === opt ? "selected" : ""}>${opt}</option>`
        ).join("");
    } else {
      selectMain.innerHTML =
        `<option value="">--Select a main--</option>` +
        mainOptions.map(opt =>
          `<option value="${opt}" ${invitee.main_choice === opt ? "selected" : ""}>${opt}</option>`
        ).join("");
    }

    // Update RSVP object on change
    selectMain.addEventListener("change", (e) => {
      invitee.main_choice = e.target.value;
    });

      // menu dropdown
    const mainLabel = document.createElement("label");
    mainLabel.textContent = "Main choice:";
    div.appendChild(mainLabel);
    
    div.appendChild(selectMain);

  //dessert
  let selectDessert = document.createElement("select");

  if (invitee.isChild) {
      selectDessert.innerHTML =
        `<option value="">--Select a main--</option>` +
        childDessertOptions.map(opt =>
          `<option value="${opt}" ${invitee.dessert_choice === opt ? "selected" : ""}>${opt}</option>`
        ).join("");
    } else {
      selectDessert.innerHTML =
        `<option value="">--Select a main--</option>` +
        dessertOptions.map(opt =>
          `<option value="${opt}" ${invitee.dessert_choice === opt ? "selected" : ""}>${opt}</option>`
        ).join("");
    }

    // Update RSVP object on change
    selectDessert.addEventListener("change", (e) => {
      invitee.dessert_choice = e.target.value;
    });

      // menu dropdown
    const dessertLabel = document.createElement("label");
    dessertLabel.textContent = "Dessert choice:";
    div.appendChild(dessertLabel);
    
    div.appendChild(selectDessert);

  // Drink dropdown
  const drinkLabel = document.createElement("label");
  drinkLabel.textContent = "Drink choice:";
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

  // remove previous highlights
  document.querySelectorAll("select").forEach(s => s.classList.remove("select-error"));

  let hasError = false;

  attendingInvitees.forEach((inv, i) => {
    const selects = container.children[i].querySelectorAll("select");

    const [starterSel, mainSel, dessertSel, drinkSel] = selects;

    if (!inv.starter_choice) {
      starterSel.classList.add("select-error");
      hasError = true;
    }

    if (!inv.main_choice) {
      mainSel.classList.add("select-error");
      hasError = true;
    }

    if (!inv.dessert_choice) {
      dessertSel.classList.add("select-error");
      hasError = true;
    }

    if (!inv.drink_choice) {
      drinkSel.classList.add("select-error");
      hasError = true;
    }
  });

  if (hasError) {
    alert("Please complete all menu selections.");
    return;
  }

  localStorage.setItem("weddingRSVP", JSON.stringify(savedRSVP));
  alert("Food choices saved!");
  goToPage("music.html");
});

function goToPage(page) {
  window.location.href = `/WeddingInviteApp/${page}`;
}
