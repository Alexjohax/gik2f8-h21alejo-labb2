todoForm.title.addEventListener("input", (e) => validateField(e.target));
todoForm.title.addEventListener("blur", (e) => validateField(e.target));
todoForm.description.addEventListener("input", (e) => validateField(e.target));
todoForm.description.addEventListener("blur", (e) => validateField(e.target));
todoForm.dueDate.addEventListener("input", (e) => validateField(e.target));
todoForm.dueDate.addEventListener("blur", (e) => validateField(e.target));

todoForm.addEventListener("submit", onSubmit);
const api = new Api("http://localhost:5000/tasks");
const todoListElement = document.getElementById("todoList");

let titleValid = false;
let descriptionValid = false;
let dueDateValid = false;

function validateField(field) {
  const { name, value } = field;
  let validationMessage = "";

  switch (name) {
    case "title": {
      if (value.length < 2) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' måste vara minst 2 tecken långt";
        console.log(validationMessage);
      } else if (value.length > 50) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' får inte vara längre än 50 tecken";
      } else {
        titleValid = true;
      }
      break;
    }
    case "description": {
      if (value.length > 500) {
        descriptionValid = false;
        validationMessage =
          "Fältet 'Beskrivning' får inte vara längre än 500 tecken";
      } else {
        descriptionValid = true;
      }
      break;
    }
    case "dueDate": {
      if (value.length === "") {
        dueDateValid = false;
        validationMessage = "Fältet 'Slutdatum' måste vara ifyllt";
      } else {
        dueDateValid = true;
      }
      break;
    }
  }

  field.previousElementSibling.innerText = validationMessage;
  field.previousElementSibling.classList.remove("hidden");
}

function onSubmit(e) {
  e.preventDefault();

  if (titleValid && descriptionValid && dueDateValid) {
    console.log("Submit");
    saveTask();
  }
}

function saveTask() {
  const task = {
    title: todoForm.title.value,
    description: todoForm.description.value,
    dueDate: todoForm.dueDate.value,
    completed: false,
  };
  api.create(task).then((task) => {
    if (task) {
      renderList();
    }
  });
  todoForm.title.value = "";
  todoForm.description.value = "";
  todoForm.dueDate.value = "";
}

function renderList() {
  api.getAll().then((tasks) => {
    //Sortera listan efter datum
    tasks.sort(function (a, b) {
      //Jämför värdena och returnera dem i rätt ordning
      /*       if (a.dueDate < b.dueDate) {
        return -1;
      } else if (a.dueDate > b.dueDate) {
        return 1;
      } else {
        return 0;
      } */
      //Jämför både datum och om uppgiften är klar
      if (a.completed && !b.completed) {
        return 1;
      }
      if (!a.completed && b.completed) {
        return -1;
      }
      if (a.dueDate < b.dueDate) {
        return -1;
      }
      if (a.dueDate > b.dueDate) {
        return 1;
      }
      return 0;
    });
    todoListElement.innerHTML = "";
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        todoListElement.insertAdjacentHTML("beforeend", renderTask(task));
        console.log(todoListElement);
      });
      // Lägg till logiken för checkboxar i renderingen
      const checkboxes = document.querySelectorAll(".checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          //Eventlistener som skickar in id och data till updateTask
          updateTask(checkbox.id, { completed: checkbox.checked });
        });
      });
    } else {
      todoListElement.insertAdjacentHTML(
        "beforeend",
        "<p>Inga uppgifter att utföra ännu</p>"
      );
    }
  });
}

const renderTask = ({ id, title, description, dueDate, completed }) => {
  let html = `
  <li class="select-none mt-2 py-2 px-2 border-b border-orange-600 ${
    completed ? "bg-green-500 bg-opacity-30" : ""
  }" >
  <div class="flex items-center">
    <h3 class="mb-3 flex-1 text-xl font-bold text-pink-800 uppercase ${
      completed ? "line-through text-opacity-50" : ""
    }">${title}</h3>
    <div class="flex flex-col w-32">
      <span class="basis-full">${dueDate}</span>
      <div class="flex basis-full my-2">
        <label for="${id}" class="flex-1">Klar</label>
        <input type="checkbox" id="${id}" name="checkbox" class="checkbox flex-1" ${
    completed ? "checked" : ""
  }>
      </div>
      <button onclick="deleteTask(${id})" class="inline-block w-full bg-orange-600 text-sm text-amber-900 border border-white px-3 py-1 rounded-md my-2">Ta bort</button>
    </div>
  </div>`;

  description &&
    (html += `<p class="ml-8 mt-2 text-xs italic">${description}</p>`);
  html += `</li>`;

  return html;
};

const deleteTask = (id) => {
  api.remove(id).then((result) => {
    if (result) {
      renderList();
    }
  });
};

const updateTask = (id, data) => {
  api.update(id, data).then((result) => {
    if (result) {
      renderList();
    }
  });
};

renderList();
