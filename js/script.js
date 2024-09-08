const SCRAMBLE_TIME_INTERVAL = 2000;
const MINIMUM_BUTTON_COUNT = 3;
const MAXIMUM_BUTTON_COUNT = 7;
const BUTTON_HEIGHT = 5;
const BUTTON_WIDTH = 10;

import { messages } from "../../lang/messages/en/user.js";

function generateColour() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

class GamePromptHandler {
  constructor(input) {
    this.gamePromptContainer = document.getElementById("buttonPrompt");
    this.gamePrompt = document.getElementById("buttonText");
    this.userButtonsInput = document.getElementById("numButtons");
    this.startButton = document.getElementById("startGame");

    this.promptMessage = messages.gamePromptMessage;
    this.buttonText = messages.startGameButtonMessage;
  }

  startGameCallback(startGame) {
    this.startButton.addEventListener(() => startGame);
  }

  getButtonCount() {
    return userButtonsInput.value;
  }

  isButtonCountValid(buttonCount) {
    if ((this.numberOfButtons < 7) & (this.numberOfButtons > 3)) {
      return true;
    }
    else{
      return false;
    }
  }
}

class Button {
  constructor(colour, number) {
    this.colourButton = document.createElement("button");
    this.buttonNumber = number;
    this.colourButton.style.position = "absolute";
    this.colourButton.style.backgroundColor = colour;
    this.colourButton.style.height = "5em";
    this.colourButton.style.width = "10em";
    this.colourButton.textContent = number;
    this.colourButton.style.left = `${(this.buttonNumber - 1) * 10}em`;
    this.handleClick = null;
  }

  display(elementName) {
    document.getElementById(elementName).appendChild(this.colourButton);
  }

  removeElement() {
    this.colourButton.remove();
  }

  move(fontSize) {
    const windowWidthInEm = window.innerWidth / fontSize;
    const windowHeightInEm = window.innerHeight / fontSize;

    let x = Math.floor(Math.random() * (windowWidthInEm - BUTTON_WIDTH));
    let y = Math.floor(Math.random() * (windowHeightInEm - BUTTON_HEIGHT));
    this.colourButton.style.left = `${x}em`;
    this.colourButton.style.top = `${y}em`;
  }

  hideNumber() {
    this.colourButton.textContent = "";
  }

  makeSelectable(gameCallBack) {
    this.handleClick = () => {
      gameCallBack(this.buttonNumber);
    };

    this.colourButton.addEventListener("click", this.handleClick);
  }

  disableButton() {
    if (this.handleClick)
      this.colourButton.removeEventListener("click", this.handleClick);
  }

  revealNumber() {
    this.colourButton.textContent = this.buttonNumber;
  }
}

class ButtonClickerGame {
  constructor(handler) {
    this.buttons = [];
    this.numberOfButtons = 0;
    this.numberOfCorrectClicks = 0;
    this.userPromptHandler = handler;
  }

  initializeGame() {
    document.getElementById("startGame");
    // .addEventListener("click", () => this.startGame());
    hideOverlay();
  }

  startGame() {
    this.clearPreviousGame();
    this.numberOfButtons = this.handler.getButtonCount();
    if (!this.handler.isButtonCountValid){
      showOverlay(messages.wrongNumberOfButtonsMessage);
    }
    this.createButtons(this.numberOfButtons);
    this.displayButtons();
    setTimeout(() => {
      this.runGame(0);
    }, this.numberOfButtons * 1000);
  }

  clearPreviousGame() {
    hideOverlay();
    this.buttons.forEach((btn) => {
      btn.removeElement();
    });
    this.numberOfCorrectClicks = 0;
    this.buttons.length = 0;
  }

  createButtons(numberOfButtons) {
    for (let i = 0; i < numberOfButtons; i++) {
      const colour = generateColour();
      const newButton = new Button(colour, i + 1);
      this.buttons.push(newButton);
    }
  }

  displayButtons() {
    this.buttons.forEach((btn) => {
      btn.display("buttonContainer");
    });
  }

  runGame(scrambleCount) {
    this.moveButtons();

    if (scrambleCount < this.numberOfButtons - 1) {
      this.scheduleNextStep(() => {
        this.runGame(scrambleCount + 1);
      });
    } else {
      this.hideNumbers();
      this.userResponse();
    }
  }

  scheduleNextStep(runAfterPause) {
    setTimeout(() => {
      runAfterPause();
    }, SCRAMBLE_TIME_INTERVAL);
  }

  moveButtons() {
    let fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    this.buttons.forEach((btn) => {
      btn.move(fontSize);
    });
  }

  hideNumbers() {
    this.buttons.forEach((btn) => {
      btn.hideNumber();
    });
  }

  userResponse() {
    this.buttons.forEach((btn) => {
      btn.makeSelectable(() => this.selectButton(btn.buttonNumber));
    });
  }

  selectButton(buttonNumber) {
    this.numberOfCorrectClicks++;

    if (this.numberOfCorrectClicks != buttonNumber) {
      this.gameOver();
    }

    if (this.numberOfCorrectClicks == this.numberOfButtons) {
      this.winGame();
    }
  }

  gameOver() {
    console.log("Game Over");
    showOverlay(messages.gameOverMessage);
    this.revealNumbers();
  }

  revealNumbers() {
    this.buttons.forEach((btn) => {
      btn.revealNumber();
    });
  }

  winGame() {
    console.log("You Win!");
    showOverlay(messages.winMessage);
  }
}

// NOTES:
// 1) maybe pass in a buttonGenerator to the ButtonGame for generating buttons
// instead of having the ButtonGame create it's own buttons
//
// 2) NO STRING LITERALS
//
// 3) NO MAGIC NUMBERS
//
// 4) REMOVE TEXT LIKE "GO!" from buttons, insert them from javascript if I can
//
// 5) A new row when the buttons are too large

//script code to start the game with dependency injection

const userPromter = new GamePromptHandler();
const colourizer = new ColourGenerator();
const buttonCreator = new ButtonGenerator();
const game = new ButtonClickerGame();
game.initializeGame();

function showOverlay(message) {
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlayMessage");
  overlayMessage.textContent = message;
  overlay.classList.remove("hidden"); // Remove hidden class to show overlay
  overlay.classList.add("visible"); // Optional, you can add visible class
}

function hideOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("hidden"); // Add hidden class to hide overlay
  overlay.classList.remove("visible"); // Optional, remove visible class
}
