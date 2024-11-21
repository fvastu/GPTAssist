export const injectStyles = () => {
    const DROPDOWN_WIDTH = 800;
    const DROPDOWN_HEIGHT = 250;
    const DROPDOWN_OFFSET = 10;
    const style = document.createElement('style');
    style.textContent = `
            .modal {
                position: fixed;
                top: 50%;
                right: 0%;
                transform: translateY(-50%) scale(0.9); /* Center vertically and apply scale */
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
                font-size: 1.5rem;
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
                gap: 0.5rem;
            }
            
            .form-group {
            color: black;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
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
        width: 500px;
        max-width: ${DROPDOWN_WIDTH}px;
        height: ${DROPDOWN_HEIGHT}px;
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
                margin-bottom: 12px;
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
            .notification.error {
                background-color: red;
            }
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                10%, 90% { opacity: 1; }
            }
    `;
    document.head.appendChild(style);
};
