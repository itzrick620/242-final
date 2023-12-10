//Nav
const toggleNav = () => {
  const navItems = document.getElementById("main-nav-items");
  navItems.classList.toggle("hidden");
};

// Display dog details
const displayDetails = async (dogId) => {
  const response = await fetch(`/api/dog/${dogId}`);
  const dog = await response.json();
};

// Add or update dog information
const addOrUpdateDog = async (event) => {
  event.preventDefault();
  const form = document.getElementById('add-edit-dog-form');
  const formData = new FormData(form);
  const imageInput = form.querySelector('input[type="file"]');
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }
  const isAddAction = !form.dataset.dogId;
  const fetchOptions = {
    method: isAddAction ? 'POST' : 'PUT',
    body: formData,
  };
  const endpoint = isAddAction ? '/api/dog' : `/api/dog/${form.dataset.dogId}`;
  const response = await fetch(endpoint, fetchOptions);
  const result = await response.json();
  if (response.ok) {
    // Refresh the list or update the dog details in the UI
  } else {
    console.error('Failed to submit dog data:', result);
  }
};

// Delete dog
const deleteDog = async (dogId) => {
  const response = await fetch(`/api/dog/${dogId}`, { method: 'DELETE' });
  if (response.ok) {
    // Remove the dog from the UI or refresh the list
  } else {
    console.error('Failed to delete dog');
  }
};

// Preview the image before uploading
const previewImage = (input) => {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgPreview = document.getElementById('img-preview');
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
};

// Fetch and display all dogs
const showDogs = async () => {
  try {
    const response = await fetch('/api/dog');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const dogs = await response.json();

    // Get the dog-list element where we'll display the dogs
    const dogList = document.getElementById('dog-list');
    const selectedDog = document.getElementById('selected-dog');

    // Clear any existing content in the dog-list and selected-dog elements
    dogList.innerHTML = '';
    selectedDog.innerHTML = '';

    // Loop through the 'dogs' array and create HTML elements to display them
    dogs.forEach((dog) => {
      // Create an image element for the dog's image
      const dogImage = document.createElement('img');
      dogImage.src = dog.image;
      dogImage.alt = `Image of ${dog.dogName}`;
      dogImage.style.maxWidth = '200px';
      dogImage.style.cursor = 'pointer';

      // When clicked, display all dog attributes
      dogImage.onclick = () => {
        selectedDog.innerHTML = ''; // Clear the selected-dog element

        // Create elements for displaying dog attributes
        const dogDetails = document.createElement('div');
        dogDetails.className = 'dog-details';

        const dogNameParagraph = document.createElement('p');
        dogNameParagraph.textContent = `Dog Name: ${dog.dogName}`;

        const ownerNameParagraph = document.createElement('p');
        ownerNameParagraph.textContent = `Owner Name: ${dog.ownerName}`;

        const descriptionParagraph = document.createElement('p');
        descriptionParagraph.textContent = `Description: ${dog.description}`;

        // Create edit and delete buttons
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => populateEditForm(dog._id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteDog(dog._id);

        // Append elements to the dogDetails div
        dogDetails.appendChild(dogNameParagraph);
        dogDetails.appendChild(ownerNameParagraph);
        dogDetails.appendChild(descriptionParagraph);
        dogDetails.appendChild(editButton);
        dogDetails.appendChild(deleteButton);

        // Append the dog image and dogDetails to the selected-dog element
        selectedDog.appendChild(dogImage);
        selectedDog.appendChild(dogDetails);
      };

      // Create a div to hold each dog image
      const dogImageContainer = document.createElement('div');
      dogImageContainer.className = 'dog-image-container';
      dogImageContainer.appendChild(dogImage);

      // Append the dogImageContainer to the dogList
      dogList.appendChild(dogImageContainer);
    });
  } catch (error) {
    console.error('Error fetching dogs:', error);
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-edit-dog-form');
  const dogList = document.getElementById('dog-list');
  const addLink = document.getElementById('add-link');
  const addEditContainer = document.getElementById('add-edit-dog-container');
  const selectedDog = document.getElementById('selected-dog');
  const imgPreview = document.getElementById('img-preview');
  const navToggle = document.getElementById("nav-toggle");
  if(navToggle) {
    navToggle.addEventListener('click', toggleNav);
  }

  // Function to show the add/edit dog form
  const showAddEditForm = () => {
    addEditContainer.classList.add('visible'); // Show the form
    form.reset(); // Clear the form
    form.dataset.dogId = ''; // Clear the data attribute used for editing
    imgPreview.src = '';
  };

  // Function to display dog details
  const displayDogDetails = (dog) => {
    selectedDog.innerHTML = `
      <h2>${dog.dogName}</h2>
      <p><strong>Owner:</strong> ${dog.ownerName}</p>
      <p><strong>Description:</strong> ${dog.description}</p>
      <img src="${dog.image}" alt="${dog.dogName}" style="max-width: 200px;">
      <button id="edit-dog">Edit</button>
      <button id="delete-dog">Delete</button>
    `;

    const editButton = document.getElementById('edit-dog');
    const deleteButton = document.getElementById('delete-dog');

    // Add event listeners for edit and delete buttons
    editButton.addEventListener('click', () => editDog(dog));
    deleteButton.addEventListener('click', () => deleteDog(dog._id));
  };

  // Click event listener for the "Add Dog" link
  addLink.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Add Dog link clicked'); //Checks if event is triggered
    showAddEditForm(); // Show the form when Add Dog is clicked
  });

  // Submit event listener for the add/edit dog form
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Create a FormData object from the form
    const formData = new FormData(form);

    try {
      let apiUrl = '/api/dog';
      let method = 'POST';

      // Check if we are editing an existing dog (editing mode)
      if (form.dataset.dogId) {
        apiUrl += `/${form.dataset.dogId}`;
        method = 'PUT';
      }

      // Send a POST or PUT request to the server
      const response = await fetch(apiUrl, {
        method,
        body: formData,
      });

      if (response.ok) {
        // Successfully added or updated the dog
        // You can refresh the dog list or update the UI here
        showDogs(); // Refresh the dog list after adding/updating
        addEditContainer.classList.remove('visible'); // Hide the form
      } else {
        // Handle error cases, display a message, etc.
        console.error('Failed to submit dog data:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting dog:', error);
    }
  });

  // Function to fetch and display the list of dogs
  const showDogs = async () => {
    try {
      const response = await fetch('/api/dog');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const dogs = await response.json();
      
      // Clear the dog list
      dogList.innerHTML = '';

      // Loop through dogs and create HTML elements to display them
      dogs.forEach((dog) => {
        const dogImage = document.createElement('img');
        dogImage.src = dog.image;
        dogImage.alt = dog.dogName;
        dogImage.style.maxWidth = '200px';

        // Click event listener for dog images
        dogImage.addEventListener('click', () => displayDogDetails(dog));

        dogList.appendChild(dogImage);
      });
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  };

  // Function to edit a dog
  const editDog = (dog) => {
    showAddEditForm(); // Show the form
    form.dataset.dogId = dog._id; // Set the data attribute for editing
    form.elements.dogName.value = dog.dogName;
    form.elements.ownerName.value = dog.ownerName;
    form.elements.description.value = dog.description;
  };

  // Function to delete a dog
  const deleteDog = async (dogId) => {
    try {
      const response = await fetch(`/api/dog/${dogId}`, { method: 'DELETE' });
      if (response.ok) {
        // Successfully deleted the dog
        // You can refresh the dog list or update the UI here
        showDogs(); // Refresh the dog list after deleting
        selectedDog.innerHTML = ''; // Clear the selected dog details
      } else {
        console.error('Failed to delete dog');
      }
    } catch (error) {
      console.error('Error deleting dog:', error);
    }
  };

  // Function to preview the image before uploading
  const previewImage = (input) => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgPreview = document.getElementById('img-preview');
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  };

  // Call this function when the file input changes
  document.getElementById('img').addEventListener('change', (event) => {
    previewImage(event.target);
  });

  // Initialize the dog list
  showDogs();
});


// Call this function when the file input changes
document.getElementById('img').addEventListener('change', (event) => {
  previewImage(event.target);
});
