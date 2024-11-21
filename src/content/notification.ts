export class Notification {
    public static showErrorMessage(message: string): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'notification error';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    public static showSuccessMessage(message: string): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'notification';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
