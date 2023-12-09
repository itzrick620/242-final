document.addEventListener('DOMContentLoaded', () => {
  const toggleNav = () => {
    document.getElementById("main-nav-items").classList.toggle("hidden");
  };

  const showAddDogForm = () => {
    document.querySelector(".dialog").classList.toggle("transparent");
    document.getElementById("add-edit-title").innerHTML = "Add Dog";
    resetForm();
  };

  const getDogs = async () => {
    try {
      const response = await fetch("/api/dog");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  };

  const showDogs = async () => {
    const dogs = await getDogs();
    const dogsDiv = document.getElementById("dog-list");
    dogsDiv.innerHTML = "";
    dogs.forEach(dog => {
      const section = document.createElement("section");
      section.classList.add("dog");
      section.innerHTML = `
        <div onclick="displayDetails('${dog._id}');">
          <h3>${dog.dogName}</h3>
          <img src="${dog.image}" alt="Dog image" style="max-width: 200px;">
        </div>
      `;
      dogsDiv.appendChild(section);
    });
  };

  const displayDetails = async (dogId) => {
    const response = await fetch(`/api/dog/${dogId}`);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }
    const dog = await response.json();

    const dogDetailsDiv = document.getElementById("dog-details");
    dogDetailsDiv.innerHTML = `
      <h3>${dog.dogName}</h3>
      <p>Owner: ${dog.ownerName}</p>
      <img src="${dog.image}" alt="${dog.dogName}" style="max-width: 200px;">
      <p>${dog.description}</p>
      <button onclick="populateEditForm('${dog._id}')">Edit</button>
      <button onclick="deleteDog('${dog._id}')">Delete</button>
    `;
  };

  const populateEditForm = (dogId) => {
    getDogById(dogId).then(dog => {
      const form = document.getElementById('add-edit-dog-form');
      form._id.value = dog._id;
      form.dogName.value = dog.dogName;
      form.ownerName.value = dog.ownerName;
      form.description.value = dog.description;
      document.getElementById('img-preview').src = dog.image;
      document.getElementById('img-preview').classList.remove('hidden');
      showAddDogForm();
      document.getElementById("add-edit-title").innerHTML = "Edit Dog";
    }).catch(error => {
      console.error('Error populating edit form:', error);
    });
  };

  const getDogById = async (dogId) => {
    try {
      const response = await fetch(`/api/dog/${dogId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dog details:', error);
    }
  };

  const deleteDog = async (dogId) => {
    if (!confirm('Are you sure you want to delete this dog?')) return;
    try {
      const response = await fetch(`/api/dog/${dogId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      showDogs();
      document.getElementById("dog-details").innerHTML = "";
    } catch (error) {
      console.error('Error deleting dog:', error);
    }
  };

  const submitDog = async (event) => {
    event.preventDefault();
    const form = document.getElementById("add-edit-dog-form");
    const formData = new FormData(form);

    if (form.img.files.length) {
      formData.append('img', form.img.files[0]);
    }

    const method = form._id.value === "-1" ? "POST" : "PUT";
    const endpoint = form._id.value === "-1" ? "/api/dog" : `/api/dog/${form._id.value}`;

    try {
      const response = await fetch(endpoint, {
        method: method,
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      showDogs();
      document.querySelector(".dialog").classList.add("transparent");
      resetForm();
    } catch (error) {
      console.error('Error submitting dog:', error);
    }
  };

  const resetForm = () => {
    const form = document.getElementById("add-edit-dog-form");
    form.reset();
    document.getElementById('img-preview').src = '';
    document.getElementById('img-preview').classList.add('hidden');
    form._id.value = "-1"; // Reset the hidden ID field for new dog entry.
  };

  // Function to handle image preview
  window.previewImage = function (input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('img-preview').src = e.target.result;
        document.getElementById('img-preview').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("main-nav-items").classList.toggle("hidden");
  });

  document.getElementById("nav-toggle").onclick = toggleNav;
  document.getElementById("add-link").onclick = showAddDogForm;
  document.getElementById("add-edit-dog-form").onsubmit = submitDog;
  document.querySelector(".close").onclick = showAddDogForm;
  showDogs();
});
