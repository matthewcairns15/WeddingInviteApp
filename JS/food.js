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
        `<option value="">--Select a desssert--</option>` +
        childDessertOptions.map(opt =>
          `<option value="${opt}" ${invitee.dessert_choice === opt ? "selected" : ""}>${opt}</option>`
        ).join("");
    } else {
      selectDessert.innerHTML =
        `<option value="">--Select a desssert--</option>` +
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
document.getElementById("submitFood").addEventListener("click", async () => {

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

  const button = document.getElementById("submitFood");
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

  localStorage.setItem("weddingRSVP", JSON.stringify(savedRSVP));
  alert("Food choices saved!");

  setTimeout(() => {
    goToPage("music.html");
  }, 800);

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



