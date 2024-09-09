const SCRAMBLE_TIME_INTERVAL = 2000;
const MINIMUM_BUTTON_COUNT = 3;
const MAXIMUM_BUTTON_COUNT = 7;
const BUTTON_HEIGHT = 5;
const BUTTON_WIDTH = 10;
const BUTTON_BUFFER = 1;
const BUTTON_TOP_OFFSET = 6;
const ONE_THOUSAND_MILLISECONDS = 1000;
const HEXADECIMAL_BASE = 16;
const MAX_COLOR_VALUE = 16777215;

import { messages } from "../../lang/messages/en/user.js";

class ColourRandomizer {
  generateColour() {
    return `#${Math.floor(Math.random() * MAX_COLOR_VALUE).toString(
      HEXADECIMAL_BASE
    )}`;
  }
}

class GamePromptHandler {
  constructor() {
    this.gamePromptContainer = document.getElementById("buttonPrompt");
    this.gamePrompt = document.getElementById("buttonText");
    this.userButtonsInput = document.getElementById("numButtons");
    this.startButton = document.getElementById("startGame");

    this.promptMessage = messages.gamePromptMessage;
    this.buttonText = messages.startGameButtonMessage;
  }

  displayPrompt() {
    this.gamePrompt.textContent = this.promptMessage;
    this.startButton.textContent = this.buttonText;
  }

  addStartGameCallback(startGame) {
    this.startButton.addEventListener("click", startGame);
  }

  getButtonCount() {
    return this.userButtonsInput.value;
  }

  isButtonCountValid(buttonCount) {
    if (
      (buttonCount < MAXIMUM_BUTTON_COUNT) &
      (buttonCount > MINIMUM_BUTTON_COUNT)
    ) {
      return true;
    }
    return false;
  }
}

class OverlayManager {
  constructor(overlayId, overlayMessageId) {
    this.overlay = document.getElementById(overlayId);
    this.overlayMessage = document.getElementById(overlayMessageId);
  }

  showOverlay(message) {
    this.overlayMessage.innerHTML = message;
    this.overlay.classList.remove("hidden"); // Remove hidden class to show overlay
    this.overlay.classList.add("visible"); // Optional: add visible class
  }

  hideOverlay() {
    this.overlay.classList.add("hidden"); // Add hidden class to hide overlay
    this.overlay.classList.remove("visible"); // Optional: remove visible class
  }
}

class Button {
  constructor(colour, number) {
    this.colourButton = document.createElement("button");
    this.buttonNumber = number;
    this.colourButton.style.position = "absolute";
    this.colourButton.style.backgroundColor = colour;
    this.colourButton.style.height = `${BUTTON_HEIGHT}em`;
    this.colourButton.style.width = `${BUTTON_WIDTH}em`;
    this.colourButton.textContent = number;
    this.handleClick = null;
  }

  display(elementName) {
    const containerWidthInEm = window.innerWidth / parseFloat(getComputedStyle(document.documentElement).fontSize);
    const buttonsPerRow = Math.floor(containerWidthInEm / (BUTTON_WIDTH + BUTTON_BUFFER));
  
    const row = Math.floor((this.buttonNumber - 1) / buttonsPerRow);
    const column = (this.buttonNumber - 1) % buttonsPerRow;
  
    this.colourButton.style.left = `${column * (BUTTON_WIDTH + BUTTON_BUFFER)}em`;
    this.colourButton.style.top = `${BUTTON_TOP_OFFSET + row * (BUTTON_HEIGHT + BUTTON_BUFFER)}em`;
  
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
  constructor(colourRandomizer, promptManager, overlayManager) {
    this.buttons = [];
    this.numberOfButtons = 0;
    this.numberOfButtonClicks = 0;
    this.colourGenerator = colourRandomizer;
    this.promptHandler = promptManager;
    this.overlayHandler = overlayManager;
  }

  initializeGame() {
    this.overlayHandler.hideOverlay();
    this.promptHandler.addStartGameCallback(() => {
      this.startGame();
    });
    this.promptHandler.displayPrompt();
  }

  startGame() {
    this.clearPreviousGame();
    this.numberOfButtons = this.promptHandler.getButtonCount();
    if (!this.promptHandler.isButtonCountValid(this.numberOfButtons)) {
      this.overlayHandler.showOverlay(messages.wrongNumberOfButtonsMessage);
    } else {
      this.createButtons(this.numberOfButtons);
      this.displayButtons();
      setTimeout(() => {
        this.runGame(0);
      }, this.numberOfButtons * ONE_THOUSAND_MILLISECONDS);
    }
  }

  clearPreviousGame() {
    this.overlayHandler.hideOverlay();
    this.buttons.forEach((btn) => {
      btn.removeElement();
    });
    this.numberOfButtonClicks = 0;
    this.buttons.length = 0;
  }

  createButtons(numberOfButtons) {
    for (let i = 0; i < numberOfButtons; i++) {
      const colour = this.colourGenerator.generateColour();
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
    if (buttonNumber == this.numberOfButtonClicks + 1) {
      this.buttons[buttonNumber - 1].revealNumber();
      this.numberOfButtonClicks++;

      if (this.numberOfButtonClicks == this.numberOfButtons) {
        this.winGame();
      }
    } else {
      this.gameOver();
    }
  }

  gameOver() {
    this.overlayHandler.showOverlay(messages.gameOverMessage);
    this.disableButtons();
    this.revealNumbers();
  }

  revealNumbers() {
    this.buttons.forEach((btn) => {
      btn.revealNumber();
    });
  }

  disableButtons() {
    this.buttons.forEach((btn) => {
      btn.disableButton();
    });
  }

  winGame() {
    this.overlayHandler.showOverlay(messages.winMessage);
  }
}

// NOTES:
//
// 2) NO STRING LITERALS
//
// 3) NO MAGIC NUMBERS
//
// 4) REMOVE TEXT LIKE "GO!" from buttons, insert them from javascript if I can
//
// 5) A new row when the buttons are too large

class GameInitializer {
  constructor() {
    // You can initialize any default configurations here if needed
  }

  runStandardMemoryGame() {
    const colourRandomizer = new ColourRandomizer();
    const userPrompter = new GamePromptHandler();
    const overlayManager = new OverlayManager("overlay", "overlayMessage");
    const game = new ButtonClickerGame(
      colourRandomizer,
      userPrompter,
      overlayManager
    );
    game.initializeGame();
  }
}

//the code to run the game
const gameInitializer = new GameInitializer();
gameInitializer.runStandardMemoryGame();
