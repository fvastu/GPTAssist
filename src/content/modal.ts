// modal.ts

import { EnhancedDropdown } from './content-script';
import { Notification } from './notification';
import { Command, generateRandomId, writeToStorage } from './storage';

const buttonSubmit = 'Save command';

enum CanEnterThisCommandResult {
    YES = 'YES',
    DUPLICATED_COMMAND = 'DUPLICATED_COMMAND',
    DUPLICATED_NAME = 'DUPLICATED_NAME',
}

const errorMessages = {
    [CanEnterThisCommandResult.DUPLICATED_COMMAND]: 'Command already exists. Please change the command.',
    [CanEnterThisCommandResult.DUPLICATED_NAME]: 'Name already exists. Please change the name.',
};

// Create form fields
const fields = [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter command name' },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Enter command description' },
    { id: 'command', label: 'Command', type: 'text', placeholder: 'Enter command' },
];

export class Modal {
    private modalElement: HTMLDivElement | null = null;
    private saveButton: HTMLButtonElement;

    constructor(saveButton: HTMLButtonElement) {
        this.saveButton = saveButton;
        this.saveButton.addEventListener('click', () => this.createModal());
    }

    private createModal(initialCommand: string = ''): void {
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
            input.value = initialCommand;

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
        submitButton.textContent = buttonSubmit;

        form.appendChild(submitButton);
        form.onsubmit = (e) => this.handleModalSubmit(e);

        modalContent.appendChild(closeButton);
        modalContent.appendChild(form);
        this.modalElement.appendChild(modalContent);

        document.body.appendChild(this.modalElement);

        // Add animation class after a brief delay
        setTimeout(() => {
            this.modalElement?.classList.add('visible');
        }, 10);
    }

    private closeModal(): void {
        this.modalElement?.classList.remove('visible');

        setTimeout(() => {
            this.modalElement?.remove();
            this.modalElement = null;
        }, 300);
    }

    private validateForm(formData: { [key: string]: string }): { [key: string]: string } {
        const errors: { [key: string]: string } = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.command.trim()) errors.command = 'Command is required';
        return errors;
    }

    private canEnterThisCommand({ name, command }: Command): CanEnterThisCommandResult {
        const hasCommand = EnhancedDropdown.OPTIONS.some((option) => option.command === command);
        if (hasCommand) return CanEnterThisCommandResult.DUPLICATED_COMMAND;

        const hasName = EnhancedDropdown.OPTIONS.some((option) => option.name === name);
        if (hasName) return CanEnterThisCommandResult.DUPLICATED_NAME;

        return CanEnterThisCommandResult.YES;
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
            command: formData.command,
            description: formData.description,
        };

        const resultInsertion = this.canEnterThisCommand(newCommand);
        if (resultInsertion === CanEnterThisCommandResult.YES) {
            EnhancedDropdown.OPTIONS.push(newCommand);
            writeToStorage(EnhancedDropdown.OPTIONS);
            Notification.showSuccessMessage('Command saved successfully!');
            this.closeModal();
            return;
        }
        Notification.showErrorMessage(errorMessages[resultInsertion]);
    }
}
