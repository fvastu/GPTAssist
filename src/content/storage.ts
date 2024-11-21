const STORAGE_KEY = 'GPTAssist_storage';

// Define the type for the object
export type Command = {
    id: string; // Unique random ID
    description?: string; // Optional description
    command: string; // Command to execute
    name: string; // Name of the action
};

// Function to generate a random ID (unique and short)
export const generateRandomId = (): string => {
    return Math.random().toString(36).substr(2, 9); // Generate a 9-character random ID
};

// Default commands to return if there is an error or no data
const defaultCommands: Command[] = [
    {
        id: generateRandomId(),
        description:
            'This command is used to refactor the code of the following snippet to improve its quality and readability.',
        command: 'Act like a software developer. Improve the following code.',
        name: 'RefactorCode',
    },
    {
        id: generateRandomId(),
        description: 'This command checks and corrects spelling errors in the text.',
        command: 'Act like an English teacher. Check and correct the spelling in the given text.',
        name: 'CheckSpelling',
    },
    {
        id: generateRandomId(),
        description: 'This command analyzes the code for potential performance optimizations.',
        command: 'Act like a performance expert. Optimize the following code for better performance.',
        name: 'OptimizePerformance',
    },
];

// Function to load commands from localStorage (or another storage system) using the 'GPTAssist_storage' key
export const loadFromStorage = (): Command[] => {
    try {
        const storedCommands = localStorage.getItem(STORAGE_KEY);
        if (storedCommands) {
            return JSON.parse(storedCommands) as Command[];
        }
        // If no commands are stored, return default commands
        return defaultCommands;
    } catch (error) {
        console.error('Error loading commands from storage:', error);
        // Return default commands in case of an error
        return defaultCommands;
    }
};

// Function to write commands to localStorage (or another storage system) using the 'GPTAssist_storage' key
export const writeToStorage = (commands: Command[]): void => {
    try {
        console.log('setting item', STORAGE_KEY, JSON.stringify(commands));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(commands));
    } catch (error) {
        console.error('Error writing commands to storage:', error);
    }
};
