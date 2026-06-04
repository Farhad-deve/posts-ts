const errorMessage = document.querySelector('#error-message') as HTMLParagraphElement;

export function showError(message: string) {
    errorMessage.hidden = false;
    errorMessage.textContent = message;
}

export function clearError() {
    errorMessage.hidden = true;
    errorMessage.textContent = '';
}

export function validatePostForm(
    title: string,
    description: string,
    image?: File
) : boolean {

    if (!title.trim()) {
        showError('Title is required.');
        return false;
    }

    if (title.length < 3) {
        showError('Title must be at least 3 characters long.');
        return false;
    }

    if (!description.trim()) {
        showError('Description is required.');
        return false;
    }

    if (description.length < 10) {
        showError('Description must be at least 10 characters long.');
        return false;
    }

    if (image) {
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (image.size > maxSize) {
            showError('Image size must be less than 5MB.');
            return false;
        }
    }

    clearError();
    return true;
    
}