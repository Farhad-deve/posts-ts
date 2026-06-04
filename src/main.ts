import {
    getAllData, addNewPost, updatePost, showModal, closeModal, ModalWrapper, Modal, ConfirmModalWrapper, ConfirmModal,
    imageInput, previewImage, previewImageContainer, addNewButton, closeModalButton, cancelButtons, newPostForm,
} from "./functions";
import { validatePostForm } from "./validation";

addNewButton.addEventListener("click", () => showModal("new"));

Modal.addEventListener("click", (e) => e.stopPropagation());
ConfirmModal.addEventListener("click", (e) => e.stopPropagation());
ModalWrapper.addEventListener("click", (e) => e.stopPropagation());

ModalWrapper.addEventListener("click", () => closeModal());
ConfirmModalWrapper.addEventListener("click", () => closeModal());
closeModalButton.forEach(btn => btn.addEventListener("click", () => closeModal()));
cancelButtons.forEach(btn => btn.addEventListener("click", () => closeModal()));

newPostForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(newPostForm);
    const mode = Modal.dataset.mode;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;

    const valid = validatePostForm(
        title,
        description,
        image.size ? image : undefined
    )

    if (!valid) return;

    if (mode === "update") {
        const id = Modal.dataset.id;
        if (!id) return;
        await updatePost(id, formData);
    } else {
        await addNewPost(formData);
    }

    closeModal();
    newPostForm.reset();
    await getAllData();
});

let currentPreviewUrl: string | null = null;

imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];

    if (!file) {
        previewImage.src = "";
        previewImageContainer.hidden = true;
        return;
    };

    if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
    }

    currentPreviewUrl = URL.createObjectURL(file);
    previewImage.src = currentPreviewUrl;
    previewImageContainer.hidden = false;
});


getAllData();
