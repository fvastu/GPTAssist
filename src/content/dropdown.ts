import { EnhancedDropdown } from './content-script';
import { Notification } from './notification';
import { loadFromStorage, writeToStorage } from './storage';

export class Dropdown {
    public static readonly HEIGHT = 250;
    public static readonly OFFSET = 10;
    public static readonly WIDTH = 300;

    public element: HTMLDivElement | null = null;
    private inputElement: HTMLInputElement | null = null;

    constructor() {}

    public setInputElement(inputElement: HTMLInputElement): void {
        this.inputElement = inputElement;
    }

    public createOrUpdateDropdown(): void {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = 'enhanced-dropdown';
            this.element.className = 'enhanced-dropdown';
            this.element.setAttribute('role', 'listbox');
            this.element.setAttribute('aria-label', 'Options');

            const inputRect = this.inputElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
            const absoluteX = inputRect.left + window.scrollX;
            const absoluteY = inputRect.top + window.scrollY;

            this.element.style.top = `${
                absoluteY - EnhancedDropdown.DROPDOWN_HEIGHT - EnhancedDropdown.DROPDOWN_OFFSET
            }px`;
            this.element.style.left = `${absoluteX}px`;

            document.body.appendChild(this.element);

            requestAnimationFrame(() => {
                this.element?.classList.add('visible');
            });
        } else {
            this.element.innerHTML = ''; // Clear previous options
        }

        const query = (this.inputElement?.value ?? this.inputElement?.innerText ?? '')
            .slice(EnhancedDropdown.PATTERN_TO_MATCH.length)
            .trim();
        this.refreshDropdown(query || '');
    }

    public refreshDropdown(query: string): void {
        if (!this.element) return;

        this.element.innerHTML = '';

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
                Notification.showSuccessMessage('Command deleted successfully!');
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

            this.element?.appendChild(option);
        });

        if (filteredOptions.length > 0) {
            (this.element.firstElementChild as HTMLElement).focus();
        } else this.removeDropdown();
    }

    private handleOptionKeydown(event: KeyboardEvent, index: number, optionText: string): void {
        if (!this.element) return;

        switch (event.key) {
            case 'Backspace':
                const input = this.inputElement?.value || this.inputElement?.innerText || '';
                // Remove the `$` pattern if it exists at the start of the input and trim any extra spaces
                const query = input.startsWith(EnhancedDropdown.PATTERN_TO_MATCH)
                    ? input.slice(EnhancedDropdown.PATTERN_TO_MATCH.length).trim()
                    : input.trim();

                // Remove the last character from the query
                let updatedQuery = query.slice(0, -1);

                // Update the input content
                if (this.inputElement) {
                    if (this.inputElement instanceof HTMLInputElement) {
                        this.inputElement.value = `${EnhancedDropdown.PATTERN_TO_MATCH}${updatedQuery}`;
                    } else {
                        (
                            this.inputElement as HTMLElement
                        ).innerText = `${EnhancedDropdown.PATTERN_TO_MATCH}${updatedQuery}`;
                    }
                }

                if (!updatedQuery) {
                    this.removeDropdown();
                    this.inputElement?.focus();
                    return;
                }

                // Refresh dropdown with the updated query
                this.refreshDropdown(updatedQuery);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.selectOption(optionText);
                break;
            case 'ArrowDown':
                event.preventDefault();
                const nextOption = this.element.children[index + 1] || this.element.firstElementChild;
                (nextOption as HTMLElement).focus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                const prevOption = this.element.children[index - 1] || this.element.lastElementChild;
                (prevOption as HTMLElement).focus();
                break;
        }
    }

    private selectOption(optionText: string): void {
        if (this.inputElement) this.inputElement.innerText = optionText;
        this.removeDropdown();
    }

    private focusOption(option: HTMLElement): void {
        if (!this.element) return;

        Array.from(this.element.children).forEach((child) => {
            child.classList.remove('focused');
            child.setAttribute('aria-selected', 'false');
        });
        option.classList.add('focused');
        option.setAttribute('aria-selected', 'true');
    }

    public removeDropdown(): void {
        this.element?.remove();
        this.element = null;
    }

    private highlightMatch(text: string, query: string): string {
        if (!query) return text;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
}
