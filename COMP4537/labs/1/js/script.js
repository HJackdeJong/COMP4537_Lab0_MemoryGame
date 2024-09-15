
    import { MESSAGES } from "../lang/messages/en/user.js"


    class Note {
        constructor(content = '') {
            this.content = content;
        }

        createNoteElement(index, onRemoveCallback) {
            const noteContainer = document.createElement('div');
            noteContainer.classList.add('note');

            const textarea = document.createElement('textarea');
            textarea.value = this.content;
            textarea.addEventListener('input', () => {
                this.content = textarea.value;
            });
            noteContainer.appendChild(textarea);

            const removeButton = document.createElement('button');
            removeButton.textContent = MESSAGES.removeNoteButton;
            removeButton.addEventListener('click', () => onRemoveCallback(index));
            noteContainer.appendChild(removeButton);

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
            return savedNotes.map(noteContent => new Note(noteContent));
        }

        saveNotesToStorage() {
            const noteContents = this.notes.map(note => note.content);
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
    
            // Handle note container initialization based on the page
            const pageTitle = document.title;
            if (pageTitle === "Writer Page") {
                this.notesContainer = document.getElementById('writerNoteDisplay');
                this.lastStoredTimeElement = document.getElementById('lastStoredTime');
                this.addButton = document.getElementById('addNote');
                this.backButton = document.getElementById('returnToIndex');
            } else if (pageTitle === "Reader Page") {
                this.notesContainer = document.getElementById('readerNoteDisplay'); // Fixed ID for reader
                this.lastUpdatedElement = document.getElementById('lastUpdatedTime');
                this.backButton = document.getElementById('returnToIndex');
            }
        }
    
        // Init Writer UI
        initWriterUI() {
            this.addButton.textContent = MESSAGES.addNoteButton;
            this.addButton.addEventListener('click', () => this.addNewNote());
    
            this.backButton.textContent = MESSAGES.backButton;
            this.backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
    
            this.renderNotes();
        }
    
        // Init Reader UI
        initReaderUI() {
            const renderNotes = () => {
                this.notesContainer.innerHTML = '';
                this.noteManager.getNotes().forEach(note => {
                    const noteElement = document.createElement('p');
                    noteElement.textContent = note.content; // Display as plain text in reader
                    this.notesContainer.appendChild(noteElement);
                });
    
                const now = new Date().toLocaleTimeString();
                this.lastUpdatedElement.textContent = `Last updated at: ${now}`;
            };
    
            renderNotes();
    
            setInterval(renderNotes, 2000);
    
            this.backButton.textContent = MESSAGES.backButton;
            this.backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    
        // Render notes for Writer Page
        renderNotes() {
            this.notesContainer.innerHTML = '';
    
            const notes = this.noteManager.getNotes();
            notes.forEach((note, index) => {
                const noteElement = note.createNoteElement(index, this.removeNote.bind(this));
                this.notesContainer.appendChild(noteElement);
            });
    
            this.updateLastStoredTime();
        }
    
        addNewNote() {
            this.noteManager.addNote();
            this.renderNotes();
        }
    
        removeNote(index) {
            this.noteManager.removeNoteAt(index);
            this.renderNotes();
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
            
            if (pageTitle === "Writer Page") {
                this.initWriterPage();
            } else if (pageTitle === "Reader Page") {
                this.initReaderPage();
            } else if (pageTitle === "Lab1:Index") {
                this.initIndexPage();
            }
        }

        initWriterPage() {
            const noteManager = new NoteManager('notes');
            const uiManager = new UIManager(noteManager);

            uiManager.initWriterUI();

            setInterval(() => {
                noteManager.saveNotesToStorage();
                uiManager.updateLastStoredTime();
            }, 2000);
        }

        initReaderPage() {
            const noteManager = new NoteManager('notes');
            const uiManager = new UIManager(noteManager);
            uiManager.initReaderUI();
        }

            initIndexPage() {
                document.getElementById('titleText').textContent = MESSAGES.pageTitle;  
                document.getElementById('nameText').textContent = "Harrison de Jong";  
                document.getElementById('promptText').textContent = "Choose an option:";
        
                const writerAnchor = document.getElementById('writerAnchor');
                writerAnchor.textContent = "Go to Writer Page";
                writerAnchor.href = "writer.html";
        
                const readerAnchor = document.querySelector('.readerAnchor');
                readerAnchor.textContent = "Go to Reader Page";
                readerAnchor.href = "reader.html";
            }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new Initializer();
    });