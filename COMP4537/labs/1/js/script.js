import { MESSAGES, ELEMENT_IDS, PAGE_TITLES, URLS, INDEX_CONTENT } from "/COMP4537/labs/1/lang/messages/en/user.js";

class Note {
  constructor(content = "") {
    this.content = content;
    this.noteElement = null;
  }

  createNoteElement(index, onRemoveCallback) {
    if (this.noteElement) {
      const textarea = this.noteElement.querySelector("textarea");
      textarea.value = this.content;
      return this.noteElement;
    }

    const noteContainer = document.createElement("div");
    noteContainer.classList.add("note");

    const textarea = document.createElement("textarea");
    textarea.value = this.content;
    textarea.addEventListener("input", () => {
      this.content = textarea.value;
    });
    noteContainer.appendChild(textarea);

    const removeButton = document.createElement("button");
    removeButton.setAttribute("id", ELEMENT_IDS.removeNote);
    removeButton.textContent = MESSAGES.removeNoteButton;
    removeButton.addEventListener("click", () => onRemoveCallback(index));
    noteContainer.appendChild(removeButton);

    this.noteElement = noteContainer;
    return noteContainer;
  }
}

class NoteManager {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.notes = this.loadNotesFromStorage();
  }

  loadNotesFromStorage() {
    const savedNotes = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    return savedNotes.map((noteContent) => new Note(noteContent));
  }

  saveNotesToStorage() {
    const noteContents = this.notes.map((note) => note.content);
    localStorage.setItem(this.storageKey, JSON.stringify(noteContents));
  }

  addNote(content) {
    const newNote = new Note(content);
    this.notes.push(newNote);
    this.saveNotesToStorage();
  }

  removeNoteAt(index) {
    this.notes.splice(index, 1);
    this.saveNotesToStorage();
  }

  getNotes() {
    return this.notes;
  }
}

class UIManager {
  constructor(noteManager) {
    this.noteManager = noteManager;
    this.pageTitle = document.title;

    if (this.pageTitle === PAGE_TITLES.writer) {
      this.initializeWriterUIElements();
    } else if (this.pageTitle === PAGE_TITLES.reader) {
      this.initializeReaderUIElements();
    }
  }

  initializeWriterUIElements() {
    this.notesContainer = document.getElementById(ELEMENT_IDS.writerNoteDisplay);
    this.lastStoredTimeElement = document.getElementById(ELEMENT_IDS.lastStoredTime);
    this.addButton = document.getElementById(ELEMENT_IDS.addNote);
    this.backButton = document.getElementById(ELEMENT_IDS.returnToIndex);
    this.header = document.getElementById(ELEMENT_IDS.writerHeader);
  }

  initializeReaderUIElements() {
    this.notesContainer = document.getElementById(ELEMENT_IDS.readerNoteDisplay);
    this.lastUpdatedElement = document.getElementById(ELEMENT_IDS.lastUpdatedTime);
    this.backButton = document.getElementById(ELEMENT_IDS.returnToIndex);
    this.header = document.getElementById(ELEMENT_IDS.readerHeader);
  }

  initWriterUI() {
    this.header.textContent = MESSAGES.writerPageTitle;
    this.addButton.textContent = MESSAGES.addNoteButton;
    this.addButton.addEventListener("click", () => this.addNewNote());

    this.backButton.textContent = MESSAGES.backButton;
    this.backButton.addEventListener("click", () => {
      window.location.href = URLS.index;
    });

    this.renderWriterNotes();
  }

  initReaderUI() {
    this.header.textContent = MESSAGES.readerPageTitle;

    const renderReaderNotes = () => {
      this.notesContainer.innerHTML = "";
      this.noteManager.notes = this.noteManager.loadNotesFromStorage();

      const notes = this.noteManager.getNotes();

      notes.forEach((note) => {
        const noteElement = document.createElement("p");
        noteElement.textContent = note.content;
        this.notesContainer.appendChild(noteElement);
      });

      const now = new Date().toLocaleTimeString();
      this.lastUpdatedElement.textContent = `${MESSAGES.lastUpdatedPrefix} ${now}`;
    };

    renderReaderNotes();

    setInterval(renderReaderNotes, 2000);

    window.addEventListener("storage", (e) => {
      if (e.key === "notes") {
        renderReaderNotes();
      }
    });

    this.backButton.textContent = MESSAGES.backButton;
    this.backButton.addEventListener("click", () => {
      window.location.href = URLS.index;
    });
  }

  renderWriterNotes() {
    this.notesContainer.innerHTML = "";

    const notes = this.noteManager.getNotes();
    notes.forEach((note, index) => {
      const noteElement = note.createNoteElement(index, this.removeNote.bind(this));
      this.notesContainer.appendChild(noteElement);
    });

    this.updateLastStoredTime();
  }

  addNewNote() {
    this.noteManager.addNote();
    this.renderWriterNotes();
  }

  removeNote(index) {
    this.noteManager.removeNoteAt(index);
    this.renderWriterNotes();
  }

  updateLastStoredTime() {
    const now = new Date().toLocaleTimeString();
    this.lastStoredTimeElement.textContent = `${MESSAGES.lastSavedPrefix} ${now}`;
  }
}

class Initializer {
  constructor() {
    this.init();
  }

  init() {
    const pageTitle = document.title;

    if (pageTitle === PAGE_TITLES.writer) {
      this.initWriterPage();
    } else if (pageTitle === PAGE_TITLES.reader) {
      this.initReaderPage();
    } else if (pageTitle === PAGE_TITLES.index) {
      this.initIndexPage();
    }
  }

  initWriterPage() {
    const noteManager = new NoteManager("notes");
    const uiManager = new UIManager(noteManager);

    uiManager.initWriterUI();

    setInterval(() => {
      noteManager.saveNotesToStorage();
      uiManager.updateLastStoredTime();
    }, 2000);
  }

  initReaderPage() {
    const noteManager = new NoteManager("notes");
    const uiManager = new UIManager(noteManager);
    uiManager.initReaderUI();
  }

  initIndexPage() {
    document.getElementById(ELEMENT_IDS.titleText).textContent = MESSAGES.pageTitle;
    document.getElementById(ELEMENT_IDS.nameText).textContent = INDEX_CONTENT.creatorName;
    document.getElementById(ELEMENT_IDS.promptText).textContent = INDEX_CONTENT.pagePrompt;

    const writerAnchor = document.getElementById(ELEMENT_IDS.writerAnchor);
    writerAnchor.textContent = INDEX_CONTENT.writePagePrompt;
    writerAnchor.href = URLS.writer;

    const readerAnchor = document.querySelector(ELEMENT_IDS.readerAnchor);
    readerAnchor.textContent = INDEX_CONTENT.readPagePrompt;
    readerAnchor.href = URLS.reader;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Initializer();
});
