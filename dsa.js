/* --- Node Classes --- */
class PatientNode {
  constructor(patientData) {
    this.patientData = patientData; // { id, name, phone, age, gender, condition }
    this.next = null;
  }
}

class WaitingNode {
  constructor(patientData) {
    this.patientData = patientData; // { name, phone, condition }
    this.next = null;
  }
}

/* --- Data Structure: Linked List (For Admitted Patients) --- */
class PatientLinkedList {
  constructor() {
    this.head = null;
  }

  //insertion program
  addPatient(patientData) {
    const newNode = new PatientNode(patientData);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }
  // deletion program
  removeLastPatient() {
    if (!this.head) {
      return null;
    }
    if (!this.head.next) {
      const removedData = this.head.patientData;
      this.head = null;
      return removedData;
    }
    let current = this.head;
    while (current.next && current.next.next) {
      current = current.next;
    }
    const removedData = current.next.patientData;
    current.next = null;
    return removedData;
  }
  //display
  getAllPatients() {
    const patients = [];
    let current = this.head;
    while (current) {
      patients.push(current.patientData);
      current = current.next;
    }
    return patients;
  }
}

/* --- Data Structure: Stack (For Undo-Delete) --- */
class DeletedPatientStack {
  constructor() {
    this.items = [];
  }
  push(patientData) {
    this.items.push(patientData);
  }
  pop() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop();
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

/* --- Data Structure: Queue (For Waiting List) --- */
class WaitingListQueue {
  constructor() {
    this.front = null;
    this.rear = null;
  }
  enqueue(patientData) {
    const newNode = new WaitingNode(patientData);
    if (!this.rear) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
  }
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    const removedData = this.front.patientData;
    this.front = this.front.next;
    if (!this.front) {
      this.rear = null;
    }
    return removedData;
  }
  isEmpty() {
    return !this.front;
  }
  getAllWaiting() {
    const waiting = [];
    let current = this.front;
    while (current) {
      waiting.push(current.patientData);
      current = current.next;
    }
    return waiting;
  }
}

/* --- Main Hospital Management Class --- */
export class Hospital {
  constructor() {
    this.patientList = new PatientLinkedList();
    this.deletedStack = new DeletedPatientStack();
    this.waitingQueue = new WaitingListQueue();
    this.nextPatientId = 1;
    // DO NOT call loadData() here
  }

  // Load data from localStorage or initial JSON
  async loadData() {
    const savedPatients = localStorage.getItem("patients");
    const savedWaiting = localStorage.getItem("waitingList");
    const savedNextId = localStorage.getItem("nextPatientId");

    if (savedPatients) {
      // If we have saved data, load it
      JSON.parse(savedPatients).forEach((patient) =>
        this.patientList.addPatient(patient)
      );
    } else {
      // No saved data. Fetch from the patient.json file.
      try {
        const response = await fetch("patient.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const initialPatients = await response.json();
        // Add the patients from the JSON file to the list
        initialPatients.forEach((patient) =>
          this.patientList.addPatient(patient)
        );
      } catch (error) {
        console.error("Error fetching initial patient data:", error);
        // Optionally, add a fallback here if the fetch fails
      }
    }

    if (savedWaiting) {
      JSON.parse(savedWaiting).forEach((patient) =>
        this.waitingQueue.enqueue(patient)
      );
    }

    if (savedNextId) {
      this.nextPatientId = parseInt(savedNextId, 10);
    } else {
      const allPatients = this.patientList.getAllPatients();
      if (allPatients.length > 0) {
        this.nextPatientId = Math.max(...allPatients.map((p) => p.id)) + 1;
      } else {
        this.nextPatientId = 103; // Start after default patients
      }
    }
  }
  // --- START: NEW SORTING METHODS ---

  // --- Sorting Method 1: Bubble Sort (for ID) ---
  getPatientsSortedById() {
    const patients = this.getAllAdmittedPatients();
    let n = patients.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (patients[j].id > patients[j + 1].id) {
          // Swap
          let temp = patients[j];
          patients[j] = patients[j + 1];
          patients[j + 1] = temp;
        }
      }
    }
    return patients;
  }

  // --- Sorting Method 2: Quick Sort (for Name) ---
  getPatientsSortedByName() {
    const patients = this.getAllAdmittedPatients();
    // We call the recursive helper
    this.quickSort(patients, 0, patients.length - 1);
    return patients;
  }

  quickSort(arr, low, high) {
    if (low < high) {
      let pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
  }

  partition(arr, low, high) {
    let pivot = arr[high].name.toLowerCase(); // Sort by name (case-insensitive)
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j].name.toLowerCase() < pivot) {
        i++;
        // Swap
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    // Swap pivot to correct position
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    return i + 1;
  }

  // --- Sorting Method 3: Insertion Sort (for Age) ---
  getPatientsSortedByAge() {
    const patients = this.getAllAdmittedPatients();
    let n = patients.length;
    for (let i = 1; i < n; i++) {
      let key = patients[i];
      let j = i - 1;
      while (j >= 0 && patients[j].age > key.age) {
        patients[j + 1] = patients[j];
        j = j - 1;
      }
      patients[j + 1] = key;
    }
    return patients;
  }

  // --- END: NEW SORTING METHODS ---
/* --- IN dsa.js, inside the Hospital class --- */

// --- START: NEW SEARCH METHODS ---

/**
 * Searches the list using Linear Search.
 * O(n) - Slow, but works on unsorted data and finds partial matches.
 */
linearSearch(key, value) {
    const patients = this.getAllAdmittedPatients();
    const results = [];
    
    // Normalize search value
    const searchTerm = String(value).toLowerCase();

    for (const patient of patients) {
        // Get patient value and normalize
        const patientValue = String(patient[key]).toLowerCase();

        // Use 'includes' for flexible matching
        if (patientValue.includes(searchTerm)) {
            results.push(patient);
        }
    }
    return results; // Returns an array of all matches
}

/**
 * Searches the list using Binary Search.
 * O(log n) - Very fast, but requires a sorted array and an exact match.
 */
binarySearch(key, value) {
    let sortedPatients;
    let searchValue = value;

    // 1. Get and SORT the array based on the key
    if (key === 'id') {
        sortedPatients = this.getPatientsSortedById();
        searchValue = parseInt(value, 10); // Ensure it's a number
    } else if (key === 'name') {
        sortedPatients = this.getPatientsSortedByName();
        searchValue = String(value).toLowerCase();
    } else if (key === 'age') {
        sortedPatients = this.getPatientsSortedByAge();
        searchValue = parseInt(value, 10);
    } else {
        return []; // Invalid key
    }

    // 2. Perform the search
    let low = 0;
    let high = sortedPatients.length - 1;

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let midValue = sortedPatients[mid][key];

        // Normalize the value from the array for comparison
        if (key === 'name') {
            midValue = String(midValue).toLowerCase();
        }

        if (midValue === searchValue) {
            return [sortedPatients[mid]]; // Found it! Return as an array
        } else if (midValue < searchValue) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return []; // Not found
}

/**
 * Searches the list using Fibonacci Search.
 * O(log n) - Fast, similar to Binary Search. Requires sorted array.
 */
fibonacciSearch(key, value) {
    let sortedPatients;
    let searchValue = value;

    // 1. Get and SORT the array
    if (key === 'id') {
        sortedPatients = this.getPatientsSortedById();
        searchValue = parseInt(value, 10);
    } else if (key === 'name') {
        sortedPatients = this.getPatientsSortedByName();
        searchValue = String(value).toLowerCase();
    } else if (key === 'age') {
        sortedPatients = this.getPatientsSortedByAge();
        searchValue = parseInt(value, 10);
    } else {
        return [];
    }

    let n = sortedPatients.length;
    if (n === 0) return [];

    // 2. Initialize Fibonacci numbers
    let fibM_minus_2 = 0; // (m-2)'th Fibonacci No.
    let fibM_minus_1 = 1; // (m-1)'th Fibonacci No.
    let fibM = fibM_minus_1 + fibM_minus_2; // m'th Fibonacci

    // Find the smallest Fibonacci number >= n
    while (fibM < n) {
        fibM_minus_2 = fibM_minus_1;
        fibM_minus_1 = fibM;
        fibM = fibM_minus_1 + fibM_minus_2;
    }

    let offset = -1;

    // 3. Perform the search
    while (fibM > 1) {
        let i = Math.min(offset + fibM_minus_2, n - 1);
        let midValue = sortedPatients[i][key];

        if (key === 'name') {
            midValue = String(midValue).toLowerCase();
        }

        if (midValue < searchValue) {
            // Move Fibonacci numbers down two
            fibM = fibM_minus_1;
            fibM_minus_1 = fibM_minus_2;
            fibM_minus_2 = fibM - fibM_minus_1;
            offset = i;
        } else if (midValue > searchValue) {
            // Move Fibonacci numbers down one
            fibM = fibM_minus_2;
            fibM_minus_1 = fibM_minus_1 - fibM_minus_2;
            fibM_minus_2 = fibM - fibM_minus_1;
        } else {
            return [sortedPatients[i]]; // Found it!
        }
    }

    // 4. Final check for the last element
    if (fibM_minus_1 && offset + 1 < n) {
         let lastValue = sortedPatients[offset + 1][key];
         if (key === 'name') lastValue = String(lastValue).toLowerCase();
         if (lastValue === searchValue) {
             return [sortedPatients[offset + 1]]; // Found
         }
    }

    return []; // Not found
}

// --- END: NEW SEARCH METHODS ---
  // Save all data structures to localStorage
  saveData() {
    localStorage.setItem(
      "patients",
      JSON.stringify(this.patientList.getAllPatients())
    );
    localStorage.setItem(
      "waitingList",
      JSON.stringify(this.waitingQueue.getAllWaiting())
    );
    localStorage.setItem("nextPatientId", this.nextPatientId.toString());
  }

  // --- Public API ---

  admitPatient(patientData) {
    const newPatient = {
      id: this.nextPatientId++,
      ...patientData,
    };
    this.patientList.addPatient(newPatient);
    this.saveData();
  }

  addToWaitingList(patientData) {
    this.waitingQueue.enqueue(patientData);
    this.saveData();
  }

  admitFromWaitingList() {
    const patientToAdmit = this.waitingQueue.dequeue();
    if (patientToAdmit) {
      this.admitPatient({
        ...patientToAdmit,
        age: 0,
        gender: "N/A",
      });
    }
  }

  deleteLastPatient() {
    const deletedPatient = this.patientList.removeLastPatient();
    if (deletedPatient) {
      this.deletedStack.push(deletedPatient);
      this.saveData();
    }
    return deletedPatient;
  }

  undoDeletePatient() {
    const patientToRestore = this.deletedStack.pop();
    if (patientToRestore) {
      this.patientList.addPatient(patientToRestore);
      this.saveData();
    }
    return patientToRestore;
  }

  // Getters for display
  getAllAdmittedPatients() {
    return this.patientList.getAllPatients();
  }

  getAllWaitingPatients() {
    return this.waitingQueue.getAllWaiting();
  }

  canUndo() {
    return !this.deletedStack.isEmpty();
  }
}