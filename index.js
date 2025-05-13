function createElement(tag, attributes, children, callbacks = {}) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) return;
      element.setAttribute(key, value);
    });
  }

  Object.entries(callbacks).forEach(([event, handler]) => {
    element.addEventListener(event, handler);
  });

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {}

  update() {
    const newNode = this.render();
    this._domNode.replaceWith(newNode);
    this._domNode = newNode;
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }
}

class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.state = { value: "" };
    this.onAddTask = onAddTask;
  }

  handleInputChange = (e) => {
    this.state.value = e.target.value;
  };

  handleAddClick = () => {
    const text = this.state.value.trim();
    if (text) {
      this.onAddTask(text);
      this.state.value = "";
      this.update();
    }
  };

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement("input", {
        type: "text",
        value: this.state.value,
        placeholder: "Задание"
      }, [], {
        change: this.handleInputChange
      }),
      createElement("button", {}, "+", {
        click: this.handleAddClick
      })
    ]);
  }
}

class Task extends Component {
  constructor(task, onToggleDone, onDelete) {
    super();
    this.task = task;
    this.onToggleDone = onToggleDone;
    this.onDelete = onDelete;
    this.confirmDelete = false;
  }

  render() {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        ...(this.task.is_done ? { checked: true } : {})
      }, [], {
        change: this.onToggleDone(this.task.id)
      }),
      createElement("label", {
        style: this.task.is_done ? "color: gray;" : ""
      }, this.task.text),
      createElement("button", {}, "🗑️", {
        click: this.handleDeleteClick
      })
    ]);
  }

  handleDeleteClick = (event) => {
    if (!this.confirmDelete) {
      this.confirmDelete = true;
      event.currentTarget.style.backgroundColor = "#DC3545";
      event.currentTarget.style.color
      console.log(event.target)
      return;
    }
    this.onDelete(this.task.id);
  };
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = JSON.parse(localStorage.getItem("todos")) || { tasks: [] };
  }

  handleAddTask = (text) => {
    const lastId = this.state.tasks.at(-1)?.id ?? 0;
    this.state.tasks.push({
      id: lastId + 1,
      is_done: false,
      text
    });
    this.update();
  };

  handleDeleteTask = (id) => {
    this.state.tasks = this.state.tasks.filter(task => task.id !== id);
    this.update();
  };

  handleToggleDone = (id) => () => {
    const task = this.state.tasks.find(task => task.id === id);
    if (task) task.is_done = !task.is_done;
    this.update();
  };

  render() {
    localStorage.setItem("todos", JSON.stringify(this.state));
    const taskElements = this.state.tasks.map(task =>
        new Task(task, this.handleToggleDone, this.handleDeleteTask).getDomNode()
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask(this.handleAddTask).getDomNode(),
      createElement("ul", { id: "todos" }, taskElements)
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
