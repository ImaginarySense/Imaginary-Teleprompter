//main.js
import Teleprompter from './teleprompter';

class Main {
  constructor() {
    this.teleprompter = new Teleprompter("prompt");
    this.teleprompter.action = this;

    document.getElementById("startPrompt").addEventListener('click', ()=> {
      this.teleprompter.startPrompt();
    });
  }

  teleprompterStarted() {
    console.log("teleprompterStarted");
  }
}

new Main();