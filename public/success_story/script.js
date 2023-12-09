const toggleNav = () => {
  document.getElementById("main-nav-items").classList.toggle("hidden");
};

const showAddDogForm = () => {
  const formContainer = document.getElementById('add-edit-dog-container');
  formContainer.classList.toggle('hidden');
};

const fetchDogs = async () => {
  try {
    const response = await fetch('/api/dog');
    const dogs = await response.json();
    displayDogs(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
  }
};

const displayDogs = (dogs) => {
  const dogList = document.getElementById('dog-list');
  dogList.innerHTML = '';

  dogs.forEach(dog => {
    if (dog.image) {
      const dogItem = document.createElement('div');
      dogItem.innerHTML = `
        <h3>${dog.dogName}</h3>
        <p>Owner: ${dog.ownerName}</p>
        <p>${dog.description}</p>
        <img src="${dog.image}" alt="Dog image" style="max-width: 200px;"> <!-- Updated to 'img' -->
      `;
      dogList.appendChild(dogItem);
    } else {
      console.error(`Dog with ID ${dog._id} has no image`);
    }
  });
};

const addDescriptionBox = (event) => {
  event.preventDefault();
  const descriptionBoxes = document.getElementById('description-boxes');
  const newTextBox = document.createElement('input');
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('name', 'description');
  descriptionBoxes.appendChild(newTextBox);
};

const submitDog = async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get form input values
  const dogName = document.getElementById('dogName').value;
  const ownerName = document.getElementById('ownerName').value;
  const description = document.getElementById('description').value;
  const img = document.getElementById('img').files[0];

  // Create a FormData object and append the form input values with matching field names
  const formData = new FormData();
  formData.append('name', dogName);
  formData.append('ownerName', ownerName);
  formData.append('description', description);
  formData.append('img', img);

  // Send a POST request to the server with the form data
  const response = await fetch('/api/dog', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    // If the request is successful (status code 200), fetch and display the updated list of dogs
    fetchDogs();
    showAddDogForm(); // Hide the add/edit dog form
  } else {
    console.error('Error submitting dog');
  }
};


window.onload = () => {
  fetchDogs();
  document.getElementById('add-link').addEventListener('click', showAddDogForm);
  document.getElementById('add-edit-dog-form').addEventListener('submit', submitDog);
  document.getElementById('add-description').addEventListener('click', addDescriptionBox);
};
