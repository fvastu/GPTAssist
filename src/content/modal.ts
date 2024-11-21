// modal.ts

import { Command, generateRandomId, loadFromStorage, writeToStorage } from './storage';

const fields = [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter command name' },
    { id: 'command', label: 'Command', type: 'text', placeholder: 'Enter command' },
    {
        id: 'description',
        label: 'Description (Optional)',
        type: 'text',
        placeholder: 'Enter a short description',
    },
];

export class Modal {
    private modalElement: HTMLDivElement | null = null;
    private saveButton: HTMLButtonElement;

    constructor(currentInput: string, saveButton: HTMLButtonElement) {
        this.saveButton = saveButton;
        this.saveButton.addEventListener('click', (e) => this.createModal(e, currentInput));
    }

    private createModal(event: Event, currentInput: string): void {
        event.preventDefault();
        if (this.modalElement) return;

        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.closeModal());

        modalContent.appendChild(closeButton);

        const form = this.createForm(currentInput);
        modalContent.appendChild(form);
        this.modalElement.appendChild(modalContent);
        document.body.appendChild(this.modalElement);

        this.modalElement.classList.add('visible');
    }

    private createForm(currentInput: string): HTMLFormElement {
        console.log('currentInput', currentInput);
        const form = document.createElement('form');
        form.className = 'modal-form';
        form.onsubmit = (e) => this.handleFormSubmit(e);

        fields.forEach((field) => {
            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.innerText = field.label;

            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            // input.placeholder = field.placeholder;

            group.appendChild(label);
            group.appendChild(input);
            form.appendChild(group);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'modal-submit';
        submitButton.innerText = 'Save Command';
        form.appendChild(submitButton);

        return form;
    }

    private handleFormSubmit(event: Event): void {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = {
            name: (form.querySelector('#name') as HTMLInputElement).value,
            description: (form.querySelector('#description') as HTMLInputElement).value,
            command: (form.querySelector('#command') as HTMLInputElement).value,
        };

        if (this.validateForm(formData)) {
            const newCommand: Command = {
                id: generateRandomId(),
                name: formData.name,
                command: formData.command.toLowerCase().replace(/\s+/g, '-'),
                description: formData.description,
            };
            const currentCommands = loadFromStorage();
            currentCommands.push(newCommand);
            writeToStorage(currentCommands);
            this.closeModal();
        }
    }

    private validateForm(formData: { [key: string]: string }): boolean {
        return formData.name.trim() !== '' && formData.command.trim() !== '';
    }

    private closeModal(): void {
        this.modalElement?.classList.remove('visible');
        setTimeout(() => {
            this.modalElement?.remove();
            this.modalElement = null;
        }, 300);
    }
}
