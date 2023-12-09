const toggleNav = () => {
    document.getElementById("main-nav-items").classList.toggle("hidden");
  };
  
  const getDogData = async () => {
    try {
      return (await fetch("api/dog/")).json();
    } catch (error) {
      console.log(error);
    }
  };
  
  const showDogData = async () => {
    let dogData = await getDogData();
    let dogDiv = document.getElementById("dog-list");
    dogDiv.innerHTML = "";
  
    dogData.forEach((dogItem, index) => {
      const section = document.createElement("section");
      section.classList.add("dog-item");
      dogDiv.append(section);
  
      // Add some margin to separate dog items
      if (index > 0) {
        section.style.marginTop = "20px"; // Adjust this value as needed
      }
  
      const a = document.createElement("a");
      a.href = "#";
      section.append(a);
  
      const h3 = document.createElement("h3");
      h3.innerHTML = dogItem.dogName;
      a.append(h3);
  
      const img = document.createElement("img");
      img.src = dogItem.image;
      section.append(img);
  
      a.onclick = (e) => {
        e.preventDefault();
        displayDogDetails(dogItem);
      };
    });
  };
  
  const displayDogDetails = (dogItem) => {
    const dogDetails = document.getElementById("dog-details");
    dogDetails.innerHTML = "";
  
    const h3 = document.createElement("h3");
    h3.innerHTML = dogItem.dogName;
    dogDetails.append(h3);
  
    const deleteLink = document.createElement("a");
    deleteLink.innerHTML = "Delete";
    dogDetails.append(deleteLink);
    deleteLink.id = "delete-link";
  
    const editLink = document.createElement("a");
    editLink.innerHTML = "Edit";
    dogDetails.append(editLink);
    editLink.id = "edit-link";
  
    const p = document.createElement("p");
    dogDetails.append(p);
    p.innerHTML = dogItem.ownerName;
  
    const ul = document.createElement("ul");
    dogDetails.append(ul);
    dogItem.description.forEach((description) => {
      const li = document.createElement("li");
      ul.append(li);
      li.innerHTML = description;
    });
  
    editLink.onclick = (e) => {
      e.preventDefault();
      document.querySelector(".dialog").classList.remove("transparent");
      document.getElementById("add-edit-title").innerHTML = "Edit Dog Item";
    };
  
    deleteLink.onclick = (e) => {
      e.preventDefault();
      deleteDogItem(dogItem);
    };
  
    populateEditForm(dogItem);
  };
  
  const deleteDogItem = async (dogItem) => {
    let response = await fetch(`/api/dog/${dogItem._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  
    if (response.status != 200) {
      console.log("error deleting");
      return;
    }
  
    let result = await response.json();
    showDogData();
    document.getElementById("dog-details").innerHTML = "";
    resetForm();
  };
  
  const populateEditForm = (dogItem) => {
    const form = document.getElementById("add-edit-dog-form");
    form._id.value = dogItem._id;
    form.name.value = dogItem.dogName;
    form.ownerName.value = dogItem.ownerName
    form.description.value = dogItem.description;
    populateDescription(dogItem);
  };
  
  const populateDescription = (dogItem) => {
    const section = document.getElementById("description-boxes");
  
    dogItem.description.forEach((description) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = description;
      section.append(input);
    });
  };
  
  const addEditDogItem = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-dog-form");
    const formData = new FormData(form);
    let response;
    formData.append("description", getDescription());
  
    // Adding a new dog item
    if (form._id.value == -1) {
      formData.delete("_id");
  
      response = await fetch("/api/dog", {
        method: "POST",
        body: formData,
      });
    }
    // Editing an existing dog item
    else {
      console.log(...formData);
  
      response = await fetch(`/api/dog/${form._id.value}`, {
        method: "PUT",
        body: formData,
      });
    }
  
    // Successful data retrieval from server
    if (response.status != 200) {
      console.log("Error posting data");
    }
  
    dogItem = await response.json();
  
    if (form._id.value != -1) {
      displayDogDetails(dogItem);
    }
  
    resetForm();
    document.querySelector(".dialog").classList.add("transparent");
    showDogData();
  };
  
  const getDescription = () => {
    const inputs = document.querySelectorAll("#description-boxes input");
    let description = [];
  
    inputs.forEach((input) => {
      description.push(input.value);
    });
  
    return players;
  };
  
  const resetForm = () => {
    const form = document.getElementById("add-edit-dog-form");
    form.reset();
    form._id = "-1";
    document.getElementById("description-boxes").innerHTML = "";
  };
  
  const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("add-edit-title").innerHTML = "Add Dog Item";
    resetForm();
  };
  
  const addDescription = (e) => {
    e.preventDefault();
    const section = document.getElementById("description-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
  };
    
  window.onload = () => {
    showDogData();
    document.getElementById("add-edit-dog-form").onsubmit = addEditDog;
    document.getElementById("add-link").onclick = showHideAdd;
  
    document.querySelector(".close").onclick = () => {
      document.querySelector(".dialog").classList.add("transparent");
    };
  
    document.getElementById("add-description").onclick = addDescription;
  
    document.getElementById("nav-toggle").onclick = toggleNav;
  };
  
  