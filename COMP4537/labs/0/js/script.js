// This project was created with the assistance of ChatGPT model 3.5
// in editing code and providing feedback

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

import { messages, elementStrings } from "/COMP4537/labs/0/lang/messages/en/user.js";


class ColourRandomizer {
  generateColour() {
    return `#${Math.floor(Math.random() * MAX_COLOR_VALUE).toString(
      HEXADECIMAL_BASE
    )}`;
  }
}

class GamePromptHandler {
  constructor(
    buttonPromptElement,
    buttonTextElement,
    numButtonsElement,
    startButtonElement,
    promptMessage,
    buttonText
  ) {
    this.gamePromptContainer = buttonPromptElement;
    this.gamePrompt = buttonTextElement;
    this.userButtonsInput = numButtonsElement;
    this.startButton = startButtonElement;

    this.promptMessage = promptMessage;
    this.buttonText = buttonText;
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
    this.overlay.classList.remove(elementStrings.hiddenClass);
    this.overlay.classList.add(elementStrings.visibleClass);
  }

  hideOverlay() {
    this.overlay.classList.add(elementStrings.hiddenClass);
    this.overlay.classList.remove(elementStrings.visibleClass);
  }
}

class ButtonFactory {
  createButtons(
    numberOfButtons,
    colourRandomizer,
    width,
    height,
    buffer,
    topOffset
  ) {
    const buttons = [];
    for (let i = 0; i < numberOfButtons; i++) {
      const colour = colourRandomizer.generateColour();
      const newButton = new Button(
        colour,
        i + 1,
        width,
        height,
        buffer,
        topOffset
      );
      buttons.push(newButton);
    }
    return buttons;
  }
}

class Button {
  constructor(colour, number, width, height, buffer, topOffset) {
    this.colourButton = document.createElement("button");
    this.buttonNumber = number;
    this.colourButton.style.backgroundColor = colour;
    this.width = width;
    this.height = height;
    this.buffer = buffer;
    this.topOffset = topOffset;
    this.colourButton.textContent = number;
    this.colourButton.style.position = "absolute";
    this.colourButton.style.height = `${BUTTON_HEIGHT}em`;
    this.colourButton.style.width = `${BUTTON_WIDTH}em`;
    this.handleClick = null;
  }

  display(elementName) {
    const containerWidthInEm =
      window.innerWidth /
      parseFloat(getComputedStyle(document.documentElement).fontSize);
    const buttonsPerRow = Math.floor(
      containerWidthInEm / (this.width + this.buffer)
    );

    const row = Math.floor((this.buttonNumber - 1) / buttonsPerRow);
    const column = (this.buttonNumber - 1) % buttonsPerRow;

    this.colourButton.style.left = `${
      column * (this.width + this.buffer)
    }em`;
    this.colourButton.style.top = `${
      this.topOffset + row * (this.height + this.buffer)
    }em`;

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
  constructor(colourRandomizer, promptManager, overlayManager, buttonMaker) {
    this.buttons = [];
    this.numberOfButtons = 0;
    this.numberOfButtonClicks = 0;
    this.colourGenerator = colourRandomizer;
    this.promptHandler = promptManager;
    this.overlayHandler = overlayManager;
    this.buttonMaker = buttonMaker;
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
      this.buttons = this.buttonMaker.createButtons(
        this.numberOfButtons,
        this.colourGenerator,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        BUTTON_BUFFER,
        BUTTON_TOP_OFFSET
      );
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

  displayButtons() {
    this.buttons.forEach((btn) => {
      btn.display(elementStrings.buttonContainerId);
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

class GameInitializer {
  runStandardMemoryGame() {
    const colourRandomizer = new ColourRandomizer();

    const buttonPromptElement = document.getElementById(elementStrings.buttonPromptId);
    const buttonTextElement = document.getElementById(elementStrings.buttonTextId);
    const numButtonsElement = document.getElementById(elementStrings.numButtonsId);
    const startButtonElement = document.getElementById(elementStrings.startGameButtonId);

    const userPrompter = new GamePromptHandler(
      buttonPromptElement,
      buttonTextElement,
      numButtonsElement,
      startButtonElement,
      messages.gamePromptMessage,
      messages.startGameButtonMessage
    );

    const overlayManager = new OverlayManager(
      elementStrings.overlayId,
      elementStrings.overlayMessageId
    );

    const buttonCreator = new ButtonFactory();

    const game = new ButtonClickerGame(
      colourRandomizer,
      userPrompter,
      overlayManager,
      buttonCreator
    );
    game.initializeGame();
  }
}

//the code to run the initializer for the game
const gameInitializer = new GameInitializer();
gameInitializer.runStandardMemoryGame();
