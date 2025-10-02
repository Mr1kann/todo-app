document.addEventListener("DOMContentLoaded", function () {
  const todos = [];
  const RENDER_EVENT = "render-todo";
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });

  function addTodo() {
    const textTodo = document.getElementById("title").value;
    const timeStamp = document.getElementById("date").value;

    const generatedId = generateId();
    const todoObj = generatedTodoObj(generatedId, textTodo, timeStamp, false);
    todos.push(todoObj);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function generateId() {
    return +new Date();
  }

  function generatedTodoObj(id, task, timestamp, isCompleted) {
    return {
      id,
      task,
      timestamp,
      isCompleted,
    };
  }

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOlist = document.getElementById("todos");
    uncompletedTODOlist.innerHTML = "";

    const completedTODOlist = document.getElementById("completed-todos");
    completedTODOlist.innerHTML = "";

    for (const todoItem of todos) {
      const todoElement = makeTodo(todoItem);
      if (!todoItem.isCompleted) {
        uncompletedTODOlist.append(todoElement);
      } else {
        completedTODOlist.append(todoElement);
      }
    }
  });

  function makeTodo(todoObj) {
    const textTitle = document.createElement("h2");
    textTitle.innerText = todoObj.task;

    const textTimeStamp = document.createElement("p");
    textTimeStamp.innerText = todoObj.timestamp;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(textTitle, textTimeStamp);

    const container = document.createElement("div");
    container.classList.add("item", "shadow");
    container.append(textContainer);
    container.setAttribute("id", `todo-${todoObj.id}`);

    if (todoObj.isCompleted) {
      const undoButton = document.createElement("button");
      undoButton.classList.add("undo-button");

      undoButton.addEventListener("click", function () {
        undoTaskFromCompleted(todoObj.id);
      });

      const trashButton = document.createElement("button");
      trashButton.classList.add("trash-button");

      trashButton.addEventListener("click", function () {
        removeTaskFromCompleted(todoObj.id);
      });

      container.append(undoButton, trashButton);
    } else {
      const checkButton = document.createElement("button");
      checkButton.classList.add("check-button");

      checkButton.addEventListener("click", function () {
        addTaskToCompleted(todoObj.id);
      });

      container.append(checkButton);
    }

    function addTaskToCompleted(todoId) {
      const todoTarget = findTodo(todoId);

      if (todoId === null) {
        return;
      }

      todoTarget.isCompleted = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData({ title: todoTarget.task, action: "marked done" });
    }

    function removeTaskFromCompleted(todoId) {
      const todoTarget = findTodoIndex(todoId);

      if (todoTarget === -1) return;

      const removedTask = todos[todoTarget].task;
      todos.splice(todoTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData({ title: removedTask, action: "removed" });
    }

    function undoTaskFromCompleted(todoId) {
      const todoTarget = findTodo(todoId);

      if (todoTarget == null) return;

      todoTarget.isCompleted = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData({ title: todoTarget.task, action: "marked as not done" });
    }

    function findTodoIndex(todoId) {
      for (const index in todos) {
        if (todos[index].id === todoId) {
          return index;
        }
      }

      return -1;
    }

    function findTodo(todoId) {
      for (const todoItem of todos) {
        if (todoItem.id === todoId) {
          return todoItem;
        }
      }
      return null;
    }

    return container;
  }

  const SAVED_EVENT = "saved-todo";
  const STORAGE_KEY = "TODO_APPS";

  function saveData(detail = null) {
    if (isStorageExist()) {
      const parsed = JSON.stringify(todos);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail }));
    }
  }

  function isStorageExist() /* boolean */ {
    if (typeof Storage === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function (event) {
    if (event.detail && event.detail.title && event.detail.action) {
      alert(`The task "${event.detail.title}" is ${event.detail.action}.`);
    }
  });

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const todo of data) {
        todos.push(todo);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
