function createElement(tag, attributes, children, callbacks = {}) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
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
  constructor() {
  }

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

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      vremenno: "",
      tasks: [
        {id: 1, is_done: false, text: "Сделать домашку"},
        {id: 2, is_done: false, text: "Сделать практику"},
        {id: 3, is_done: false, text: "Пойти домой"}
      ]
    }
  }

  onAddTask = () => {
    this.state.tasks.push({
      id: this.state.tasks[this.state.tasks.length - 1].id + 1,
      is_done: false,
      text: this.state.vremenno
    });
    this.state.vremenno = "";
    this.update();
    console.log(this.state);
  }

  onAddInputChange = (e) => {
    this.state.vremenno = e.target.value;
  };

  onDeleteTask = (id) => () => {
    this.state.tasks = this.state.tasks.filter(task => task.id !== id);
    this.update();
  };

  onToggleDone = (id) => () => {
    const task = this.state.tasks.find(task => task.id === id);
    task.is_done = !task.is_done;
    this.update();
  };

  render() {
    const taskElements = this.state.tasks.map(task =>
        createElement("li", {}, [
          createElement("input", {
            type: "checkbox",
            ...(task.is_done ? { checked: true } : {})
          }, [], {
            change: this.onToggleDone(task.id)
          }),
          createElement("label", {
            style: task.is_done ? "color: gray;" : ""
          }, task.text),
          createElement("button", {}, "🗑️", {
            click: this.onDeleteTask(task.id)
          })
        ])
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          value: this.state.vremenno,
          placeholder: "Задание",
        },[], {
          "change": this.onAddInputChange
        }),
        createElement("button", { id: "add-btn" }, "+", {
          "click": this.onAddTask
        }),
      ]),
      createElement("ul", { id: "todos" }, taskElements),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
