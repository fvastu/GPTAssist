import { Dropdown } from './dropdown';
import { Modal } from './modal';
import { Command, loadFromStorage } from './storage';
import { injectStyles } from './styles';

const BUTTON_SUBMIT_TEXT = 'Save command';
const SAVE_ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>`;

export class EnhancedDropdown {
    static readonly DROPDOWN_HEIGHT = 250;
    static readonly DROPDOWN_OFFSET = 10;
    static readonly DROPDOWN_WIDTH = 300;
    static readonly PATTERN_TO_MATCH = '$';
    static OPTIONS: Command[] = [];

    private formElement: HTMLFormElement | null = null;
    private inputElement: HTMLInputElement | null = null;
    private dropdownElement: Dropdown | null = null;
    private saveButton: HTMLButtonElement | null = null;

    constructor(formElement: HTMLFormElement) {
        this.formElement = formElement;
        EnhancedDropdown.OPTIONS = loadFromStorage();
        this.createSaveButton();
        new Modal(this.saveButton!);
        this.dropdownElement = new Dropdown();
        this.setupEventListeners();
        injectStyles();
    }

    private createSaveButton(): void {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        this.saveButton = document.createElement('button');
        this.saveButton.innerHTML = `${SAVE_ICON_SVG} ${BUTTON_SUBMIT_TEXT}`;
        this.saveButton.className = 'save-button';
        this.saveButton.setAttribute('aria-label', BUTTON_SUBMIT_TEXT);
        this.saveButton.setAttribute('title', BUTTON_SUBMIT_TEXT);

        buttonContainer.appendChild(this.saveButton);
        this.formElement!.insertBefore(buttonContainer, this.formElement!.firstChild);
    }

    private setupEventListeners(): void {
        this.formElement?.addEventListener('input', this.handleInput.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    private handleInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const inputValue = (inputElement.value ?? inputElement.innerText).trim();

        if (!inputValue.startsWith(EnhancedDropdown.PATTERN_TO_MATCH)) {
            this.dropdownElement?.removeDropdown();
        } else {
            this.dropdownElement?.setInputElement(inputElement);
            this.dropdownElement?.createOrUpdateDropdown();
        }
    }

    private handleOutsideClick(event: MouseEvent): void {
        const target = event.target as Node;
        if (this.dropdownElement?.element && !this.dropdownElement.element.contains(target)) {
            this.dropdownElement.removeDropdown();
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.dropdownElement?.removeDropdown();
            this.inputElement?.focus();
        }
    }

    static initializeWithPolling(): void {
        let initialized = false;

        const pollInterval = setInterval(() => {
            const formElement = document.querySelector('form') as HTMLFormElement;
            if (formElement && !initialized) {
                new EnhancedDropdown(formElement);
                initialized = true;
                clearInterval(pollInterval);
            }
        }, 100); // Poll every 100ms
    }
}

// Initialize the dropdown when the form is available
setTimeout(() => EnhancedDropdown.initializeWithPolling(), 1000);
