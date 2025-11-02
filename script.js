import { Hospital } from "./dsa.js";

// --- Initialize Hospital System ---
const hospital = new Hospital();

// --- Main Function (runs on script load) ---
async function main() {
  // 1. Wait for all data to be loaded from storage/JSON
  await hospital.loadData();

  // 2. Now that data is ready, set up the correct page
  if (document.body.classList.contains("login-body")) {
    setupLoginPage();
  } else if (document.body.classList.contains("dashboard-body")) {
    // Simple auth check
    if (sessionStorage.getItem("loggedIn") !== "true") {
      window.location.href = "index.html";
      return; // Stop execution
    }
    setupDashboardPage();
  }
}

// --- Login Page Setup ---
function setupLoginPage() {
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sessionStorage.setItem("loggedIn", "true");
    window.location.href = "dashboard.html";
  });
}

// --- Dashboard Page Setup ---
function setupDashboardPage() {
  // --- Get Elements ---
  const addPatientForm = document.getElementById("add-patient-form");
  const addToWaitingListBtn = document.getElementById(
    "add-to-waiting-list-btn"
  );
  const deleteLastBtn = document.getElementById("delete-last-btn");
  const undoDeleteBtn = document.getElementById("undo-delete-btn");
  const admitNextBtn = document.getElementById("admit-next-patient-btn");
  const logoutBtn = document.getElementById("logout-btn");
  // --- Inside setupDashboardPage() in script.js ---

  // ... (other element getters like addPatientForm, logoutBtn) ...
  const searchInput = document.getElementById("search-input");
  const searchKeySelect = document.getElementById("search-key-select");
  // const searchLinearBtn = document.getElementById("search-linear-btn");
  // const searchBinaryBtn = document.getElementById("search-binary-btn");
  // const searchFibBtn = document.getElementById("search-fib-btn");
  const searchBtn = document.getElementById('search-btn');
  const clearSearchBtn = document.getElementById("clear-search-btn");

  // --- Inside setupDashboardPage() in script.js ---

  // ... (other event listeners like addPatientForm, logoutBtn) ...

  // --- Search Event Listeners ---
  function handleSearch(searchFunction) {
    const value = searchInput.value;
    const key = searchKeySelect.value;

    if (!value) {
      alert("Please enter a search term.");
      return;
    }

    // Call the specific search function (e.g., hospital.linearSearch)
    const results = searchFunction.call(hospital, key, value);

    // Re-render the patient table with *only* the results
    renderPatientList(results);

    if (results.length === 0) {
      alert("No patients found.");
    }
  }

// --- New Smart Search Event Listener ---
searchBtn.addEventListener('click', () => {
    const value = searchInput.value;
    const key = searchKeySelect.value;

    if (!value) {
        alert('Please enter a search term.');
        return;
    }

    let results = [];
    let searchType = ""; // For our alert

    // This is the "smart" logic that dispatches the correct algorithm
    switch (key) {
        case 'name':
            // Use Linear Search for partial name matching
            results = hospital.linearSearch(key, value);
            searchType = "Linear Search (for partial name matches)";
            break;
        case 'id':
            // Use Binary Search for exact, fast ID matching
            results = hospital.binarySearch(key, value);
            searchType = "Binary Search (for exact ID)";
            break;
        case 'age':
            // Use Fibonacci Search for exact, fast age matching
            results = hospital.fibonacciSearch(key, value);
            searchType = "Fibonacci Search (for exact age)";
            break;
    }

    // Re-render the patient table with *only* the results
    renderPatientList(results); 

    if (results.length === 0) {
        alert('No patients found.');
    } else {
        // Optional: for your own testing, you can see which algorithm ran
        console.log(`Search completed using: ${searchType}`);
    }
});
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    // renderAllLists() will reset both tables
    renderAllLists();
  });

  // --- Event Listeners ---
  addPatientForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const patientData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      age: parseInt(document.getElementById("age").value),
      gender: document.getElementById("gender").value,
      condition: document.getElementById("condition").value,
    };
    hospital.admitPatient(patientData);
    addPatientForm.reset();
    renderAllLists();
  });

  addToWaitingListBtn.addEventListener("click", () => {
    const patientData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      condition: document.getElementById("condition").value,
    };
    if (!patientData.name || !patientData.phone || !patientData.condition) {
      alert(
        "Please fill in at least Name, Phone, and Condition to add to waiting list."
      );
      return;
    }
    hospital.addToWaitingList(patientData);
    addPatientForm.reset();
    renderAllLists();
  });

  deleteLastBtn.addEventListener("click", () => {
    hospital.deleteLastPatient();
    renderAllLists();
  });

  undoDeleteBtn.addEventListener("click", () => {
    hospital.undoDeletePatient();
    renderAllLists();
  });

  admitNextBtn.addEventListener("click", () => {
    hospital.admitFromWaitingList();
    renderAllLists();
  });

  // --- Inside setupDashboardPage() in script.js ---

  // Get the sort buttons
  const sortIdBtn = document.getElementById("sort-id-btn");
  const sortNameBtn = document.getElementById("sort-name-btn");
  const sortAgeBtn = document.getElementById("sort-age-btn");

  // Add event listeners for sorting
  sortIdBtn.addEventListener("click", () => {
    // Get the sorted list
    const sortedPatients = hospital.getPatientsSortedById();
    // Re-render the table with the sorted list
    renderPatientList(sortedPatients);
  });

  sortNameBtn.addEventListener("click", () => {
    const sortedPatients = hospital.getPatientsSortedByName();
    renderPatientList(sortedPatients);
  });

  sortAgeBtn.addEventListener("click", () => {
    const sortedPatients = hospital.getPatientsSortedByAge();
    renderPatientList(sortedPatients);
  });
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  });

  // --- Initial Render ---
  // This now runs *after* all data is loaded
  renderAllLists();
}

// --- Render Functions ---
function renderAllLists() {
  renderPatientList();
  renderWaitingList();
  updateButtonStates();
}

// --- New, modified function ---
function renderPatientList(patientsToRender = null) {
  const tableBody = document.getElementById("patient-table-body");
  // If a specific list (like a sorted one) isn't provided,
  // get the default list from the hospital.
  const patients = patientsToRender || hospital.getAllAdmittedPatients();
  tableBody.innerHTML = "";

  // The rest of the function is the same!
  if (patients.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6" class="empty-row">No admitted patients.</td></tr>';
    return;
  }

  patients.forEach((patient) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.phone}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.condition}</td>
        `;
    tableBody.appendChild(row);
  });
}

function renderWaitingList() {
  const tableBody = document.getElementById("waiting-list-body");
  const waitingList = hospital.getAllWaitingPatients();
  tableBody.innerHTML = "";

  if (waitingList.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="3" class="empty-row">Waiting list is empty.</td></tr>';
    return;
  }

  waitingList.forEach((patient) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.phone}</td>
            <td>${patient.condition}</td>
        `;
    tableBody.appendChild(row);
  });
}

function updateButtonStates() {
  const undoDeleteBtn = document.getElementById("undo-delete-btn");
  const admitNextBtn = document.getElementById("admit-next-patient-btn");

  undoDeleteBtn.disabled = !hospital.canUndo();
  admitNextBtn.disabled = hospital.getAllWaitingPatients().length === 0;
}

// --- Start the Application ---
main();
