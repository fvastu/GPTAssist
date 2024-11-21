import { Command, generateRandomId, loadFromStorage, writeToStorage } from './storage';

class EnhancedDropdown {
    private static readonly DROPDOWN_HEIGHT = 250;
    private static readonly DROPDOWN_OFFSET = 10;
    private static readonly DROPDOWN_WIDTH = 500;
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
        this.injectStyles();
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

    private injectStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
                    .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }
            
            .modal-backdrop.visible {
                opacity: 1;
            }
            
            .modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background-color: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                opacity: 0;
                transition: all 0.3s ease;
                width: 90%;
                max-width: 500px;
            }
            
            .modal.visible {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 2rem;
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                padding: 0.5rem;
                line-height: 1;
                transition: color 0.3s ease;
            }
            
            .modal-close:hover {
                color: #333;
            }
            
            .modal-form {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .form-group label {
                font-weight: 600;
                color: #333;
            }
            
            .form-group input {
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }
            
            .error-message {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }
            
            .modal-submit {
                background-color: #3498db;
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.3s ease;
                margin-top: 1rem;
            }
            
            .modal-submit:hover {
                background-color: #2980b9;
                transform: translateY(-1px);
            }
            
            .modal-submit:active {
                transform: translateY(0);
            }
      .enhanced-dropdown {
        position: absolute;
        z-index: 1000;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        width: 300px;
        max-width: ${EnhancedDropdown.DROPDOWN_WIDTH}px;
        height: ${EnhancedDropdown.DROPDOWN_HEIGHT}px;
        overflow-y: auto;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      }
        .enhanced-dropdown.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .dropdown-option {
                padding: 0.75rem 1rem;
                cursor: pointer;
                color: #1a202c;
                transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
            }
            .dropdown-option:hover,
            .dropdown-option:focus {
                background-color: #edf2f7;
                color: #2d3748;
                outline: none;
            }
            .dropdown-option.focused {
                background-color: #e2e8f0;
                color: #2d3748;
            }
            .highlight {
                background-color: #fefcbf;
                color: #744210;
            }
            .button-container {
                display: flex;
                align-items: center;
                margin-top: 12px;
                justify-content: center;
            }
            .save-button {
                padding: 8px 16px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
            }
            .save-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    120deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent
                );
                transition: all 0.5s;
            }
            .save-button:hover {
                background-color: #2980b9;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                transform: translateY(-2px);
            }
            .save-button:hover::before {
                left: 100%;
            }
            .save-button:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
            }
            .save-button:active {
                transform: translateY(1px);
            }
            .delete-button {
                margin-left: 32px;
            }
            .gpt-label {
                margin-left: 15px;
                font-size: 12px;
                color: #7f8c8d;
                font-style: italic;
                background-color: #ecf0f1;
                padding: 4px 8px;
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            .button-container:hover .gpt-label {
                color: #2c3e50;
                background-color: #bdc3c7;
            }
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #48bb78;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                animation: fadeInOut 3s ease-in-out;
            }
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                10%, 90% { opacity: 1; }
            }
    `;
        document.head.appendChild(style);
    }
}

setTimeout(() => {
    new EnhancedDropdown();
}, 2000);
