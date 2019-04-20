class Teleprompter {
  constructor(container, settings) {
    this.loadPromptWithContainer(container);
  }

  loadPromptWithContainer(container) {
    // set container
    this._container = container;
    if (typeof this._container === 'string') {
      this._container = document.getElementById(this._container);
    }
    if (this._container && this._container.nodeType) {
      // J: According to Keyvan's research, this is one of the least efficient ways to style DOM components and increases load times.
      this._container.style.backgroundColor = "lightblue";
      this._container.style.textAlign = 'center';
      this._container.style.width = '120px';
      this._container.style.height = '150px';
    } else {
      console.log("container is undefined");
    }
  }

  startPrompt() {
    // Do prompting stuff
    if (this._action && typeof this._action.teleprompterStarted === "function") {
      this._action.teleprompterStarted();
    }
  }

  set action(instance) { //Actions, Delegate, Responses, .....
    this._action = instance;
  }

}

export default Teleprompter;
