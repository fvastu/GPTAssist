import { Command, generateRandomId, loadFromStorage, writeToStorage } from './storage';
import { injectStyles } from './styles';

class EnhancedDropdown {
    private static readonly DROPDOWN_HEIGHT = 250;
    private static readonly DROPDOWN_OFFSET = 10;
    private static readonly DROPDOWN_WIDTH = 300;
    private static readonly PATTERN_TO_MATCH = '$';
    private static OPTIONS: Command[] = [];

    private formElement: HTMLFormElement;
    private inputElement: HTMLInputElement | null = null;
    private dropdownElement: HTMLDivElement | null = null;
    private saveButton: HTMLButtonElement;
    private modalElement: HTMLDivElement | null = null;

    constructor() {
        this.formElement = document.querySelector('form') as HTMLFormElement;
        if (!this.formElement) {
            throw new Error('No form element found on the page');
        }
        EnhancedDropdown.OPTIONS = loadFromStorage();
        this.createSaveButton();
        this.setupEventListeners();
        injectStyles();
    }

    private createSaveButton(): void {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        this.saveButton = document.createElement('button');
        this.saveButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Save Command';
        this.saveButton.className = 'save-button';
        this.saveButton.setAttribute('aria-label', 'Save command');
        this.saveButton.setAttribute('title', 'Save command');

        buttonContainer.appendChild(this.saveButton);
        this.formElement.firstChild?.appendChild(buttonContainer);
    }

    private createModal(): void {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        // Create modal container
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.closeModal();

        // Create form
        const form = document.createElement('form');
        form.className = 'modal-form';

        // Create form fields
        const fields = [
            { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter command name' },
            { id: 'description', label: 'Description', type: 'text', placeholder: 'Enter command description' },
            { id: 'command', label: 'Command', type: 'text', placeholder: 'Enter command' },
        ];

        fields.forEach((field) => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;

            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            input.placeholder = field.placeholder;

            const error = document.createElement('span');
            error.className = 'error-message';
            error.id = `${field.id}-error`;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            formGroup.appendChild(error);
            form.appendChild(formGroup);
        });

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'modal-submit';
        submitButton.textContent = 'Save Command';

        form.appendChild(submitButton);
        form.onsubmit = (e) => this.handleModalSubmit(e);

        modalContent.appendChild(closeButton);
        modalContent.appendChild(form);
        this.modalElement.appendChild(modalContent);

        document.body.appendChild(backdrop);
        document.body.appendChild(this.modalElement);

        // Add animation class after a brief delay
        setTimeout(() => {
            backdrop.classList.add('visible');
            this.modalElement?.classList.add('visible');
        }, 10);
    }

    private closeModal(): void {
        const backdrop = document.querySelector('.modal-backdrop');
        backdrop?.classList.remove('visible');
        this.modalElement?.classList.remove('visible');

        setTimeout(() => {
            backdrop?.remove();
            this.modalElement?.remove();
            this.modalElement = null;
        }, 300);
    }

    private validateForm(formData: { [key: string]: string }): { [key: string]: string } {
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }

        if (!formData.command.trim()) {
            errors.command = 'Command is required';
        } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.command)) {
            errors.command = 'Command can only contain letters, numbers, spaces, and hyphens';
        }

        return errors;
    }

    private handleModalSubmit(event: Event): void {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = {
            name: (form.querySelector('#name') as HTMLInputElement).value,
            description: (form.querySelector('#description') as HTMLInputElement).value,
            command: (form.querySelector('#command') as HTMLInputElement).value,
        };

        const errors = this.validateForm(formData);

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach((el) => {
            el.textContent = '';
        });

        if (Object.keys(errors).length > 0) {
            // Display errors
            Object.entries(errors).forEach(([field, message]) => {
                const errorEl = document.querySelector(`#${field}-error`);
                if (errorEl) errorEl.textContent = message;
            });
            return;
        }

        // Save the command
        const newCommand: Command = {
            id: generateRandomId(),
            name: formData.name,
            command: formData.command.toLowerCase().replace(/\s+/g, '-'),
            description: formData.description,
        };

        EnhancedDropdown.OPTIONS.push(newCommand);
        writeToStorage(EnhancedDropdown.OPTIONS);
        this.showNotification('Command saved successfully!');
        this.closeModal();
    }

    private setupEventListeners(): void {
        this.formElement.addEventListener('input', this.handleInput.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        this.saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.createModal();
        });
    }

    private handleSave(event: Event): void {
        event.preventDefault();
        const value = this.inputElement?.value ?? this.inputElement?.innerText;
        if (value?.trim()) {
            const newCommand: Command = {
                name: value.trim(),
                command: value.trim().toLowerCase().replace(/\s+/g, '-'),
                id: generateRandomId(),
            };
            EnhancedDropdown.OPTIONS.push(newCommand);
            writeToStorage(EnhancedDropdown.OPTIONS);
            this.showNotification('Command saved successfully!');
        }
    }

    private showNotification(message: string): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'notification';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    private handleInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const inputValue = (inputElement.value ?? inputElement.innerText).trim();

        console.log({ inputValue });

        if (this.dropdownElement && !inputValue.startsWith(EnhancedDropdown.PATTERN_TO_MATCH)) {
            this.removeDropdown();
        }

        if (inputValue.startsWith(EnhancedDropdown.PATTERN_TO_MATCH)) {
            this.inputElement = inputElement; // Set the current input field
            this.createOrUpdateDropdown();
        }
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (
            this.dropdownElement &&
            !this.dropdownElement.contains(event.target as Node) &&
            event.target !== this.inputElement
        ) {
            this.removeDropdown();
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' && this.dropdownElement) {
            this.removeDropdown();
            this.inputElement?.focus();
        }
    }

    private createOrUpdateDropdown(): void {
        console.log('Creating or updating dropdown');
        if (!this.dropdownElement) {
            this.dropdownElement = document.createElement('div');
            this.dropdownElement.id = 'enhanced-dropdown';
            this.dropdownElement.className = 'enhanced-dropdown';
            this.dropdownElement.setAttribute('role', 'listbox');
            this.dropdownElement.setAttribute('aria-label', 'Options');

            const inputRect = this.inputElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
            const absoluteX = inputRect.left + window.scrollX;
            const absoluteY = inputRect.top + window.scrollY;
            console.log({ absoluteX, absoluteY });
            this.dropdownElement.style.top = `${
                absoluteY - EnhancedDropdown.DROPDOWN_HEIGHT - EnhancedDropdown.DROPDOWN_OFFSET
            }px`;
            this.dropdownElement.style.left = `${absoluteX}px`;

            document.body.appendChild(this.dropdownElement);

            requestAnimationFrame(() => {
                this.dropdownElement?.classList.add('visible');
            });
        } else {
            this.dropdownElement.innerHTML = ''; // Clear previous options
        }

        const query = (this.inputElement?.value ?? this.inputElement?.innerText ?? '')
            .slice(EnhancedDropdown.PATTERN_TO_MATCH.length)
            .trim();
        this.refreshDropdown(query || '');
    }

    private refreshDropdown(query: string): void {
        console.log('refreshDropdown -> query', query);
        if (!this.dropdownElement) return;

        this.dropdownElement.innerHTML = '';

        const filteredOptions = EnhancedDropdown.OPTIONS.filter((option) =>
            option.name.toLowerCase().includes(query.toLowerCase())
        );

        filteredOptions.forEach((filteredOption, index) => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.innerHTML = this.highlightMatch(filteredOption.name, query);
            option.tabIndex = 0;

            // Create the delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.setAttribute('aria-label', 'Delete option');
            deleteButton.innerHTML = '🗑️'; // You can use any icon or text here for the delete button

            // Add event listener for delete button
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the option click event from triggering
                writeToStorage(EnhancedDropdown.OPTIONS.filter((option) => option.id !== filteredOption.id));
                this.showNotification('Command deleted successfully!');
                EnhancedDropdown.OPTIONS = loadFromStorage(); // force reload after the flush
                this.refreshDropdown('');
            });

            // Append the delete button to the option
            option.appendChild(deleteButton);

            // Event listeners for other actions
            option.addEventListener('keydown', (event) =>
                this.handleOptionKeydown(event, index, filteredOption.command)
            );
            option.addEventListener('click', () => this.selectOption(filteredOption.command));
            option.addEventListener('focus', () => this.focusOption(option));

            this.dropdownElement?.appendChild(option);
        });

        if (filteredOptions.length > 0) {
            (this.dropdownElement.firstElementChild as HTMLElement).focus();
        } else this.removeDropdown();
    }

    private handleOptionKeydown(event: KeyboardEvent, index: number, optionText: string): void {
        if (!this.dropdownElement) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                console.log('optionText', optionText);
                event.preventDefault();
                this.selectOption(optionText);
                break;
            case 'ArrowDown':
                event.preventDefault();
                const nextOption = this.dropdownElement.children[index + 1] || this.dropdownElement.firstElementChild;
                (nextOption as HTMLElement).focus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                const prevOption = this.dropdownElement.children[index - 1] || this.dropdownElement.lastElementChild;
                (prevOption as HTMLElement).focus();
                break;
        }
    }

    private selectOption(optionText: string): void {
        console.log('Selected option:', optionText, this.inputElement);
        if (this.inputElement) this.inputElement.innerText = optionText;
        this.removeDropdown();
    }

    private focusOption(option: HTMLElement): void {
        if (!this.dropdownElement) return;

        Array.from(this.dropdownElement.children).forEach((child) => {
            child.classList.remove('focused');
            child.setAttribute('aria-selected', 'false');
        });
        option.classList.add('focused');
        option.setAttribute('aria-selected', 'true');
    }

    private removeDropdown(): void {
        this.dropdownElement?.remove();
        this.dropdownElement = null;
    }

    private highlightMatch(text: string, query: string): string {
        if (!query) return text;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
}

setTimeout(() => {
    new EnhancedDropdown();
}, 2000);
