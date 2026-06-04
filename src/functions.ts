import { type Post } from "./types";
import { api } from "./api";

// Elements used in main.ts
export const ModalWrapper = document.querySelector("#modalWrapper") as HTMLElement;
export const Modal = document.querySelector("#modal") as HTMLElement;
export const ConfirmModalWrapper = document.querySelector("#confirmModalWrapper") as HTMLElement;
export const ConfirmModal = document.querySelector("#confirmModal") as HTMLElement;
export const previewImageContainer = document.querySelector("#preview-img-container") as HTMLElement;

export const previewImage = document.querySelector("#preview-img") as HTMLImageElement;
export const imageInput = document.querySelector("#imageInput") as HTMLInputElement;

export const addNewButton = document.querySelector("#addNewPost") as HTMLButtonElement;
export const closeModalButton = document.querySelectorAll("#modal-close-btn") as NodeListOf<HTMLButtonElement>;
export const cancelButtons = document.querySelectorAll("#cancel-btn") as NodeListOf<HTMLButtonElement>;

export const newPostForm = document.querySelector("#newPostForm") as HTMLFormElement;

// Buttons
const confirmDeleteBtn = document.querySelector("#delete-btn") as HTMLButtonElement;
const saveBtn = document.querySelector('#save-btn') as HTMLButtonElement;

// Containers
const loadingContainer = document.querySelector("#loading-container") as HTMLElement;
const main = document.querySelector("#cards-container") as HTMLElement;

// Inputs, Textareas
const titleInput = document.querySelector("#TitleInput") as HTMLInputElement;
const descriptionTextarea = document.querySelector("#descriptionTextarea") as HTMLTextAreaElement;

// Span, Heading elements
const descriptionCounter = document.querySelector('#descriptionCounter') as HTMLSpanElement;
const uploadImgHint = document.querySelector('#upload-img-hint') as HTMLSpanElement;
const modalTitle = document.querySelector('#modal-title') as HTMLHeadingElement;

const posts: Post[] = [];

function renderPost(data: Post) {
  const card = document.createElement("article");
  card.classList.add('flex', 'flex-col', 'gap-[1rem]', 'bg-[#8080802c]', 'border-1', 'border-[#ffffff57]', 'rounded-[12px]', 'p-[0.6rem]', 'overflow-hidden');
  card.setAttribute('data-id', data.id);
  const cardDate = new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

  card.innerHTML = `
        <div class="relative">
            <img src="${data.imageUrl}"
            alt="${data.title}" class="rounded-[8px] h-[200px] object-cover w-full pointer-events-none">
            <span class="absolute text-[#fff] text-[clamp(0.7rem,0.8vw,1rem)] bottom-[0.5rem] left-[0.5rem] rounded-full bg-[#00000059] border-1 border-[#ffffff2e] tracking-[2px] px-[0.5rem] py-[0.2rem]">
                ${cardDate}
            </span>
          </div>

          <div class="flex flex-col gap-[0.5rem] flex-1">
            <h2 class="text-[#fff] font-[600] text-[clamp(1rem,1.2vw,1.3rem)] leading-tight">${data.title}</h2>
            <p class="text-[#dcdcdc] text-sm leading-relaxed overflow-hidden line-clamp-4 break-words">
              ${data.description}
            </p>
          </div>

          <div class="flex gap-[1rem]" id="action-buttons">
            <button type="button" data-id="${data.id}" data-action="update" class="text-[#fff] bg-[#55f] border-1 border-[#085effc0] flex-1 px-[1rem] py-[0.3rem] rounded-[5px] font-[600] cursor-pointer">Update</button>
            <button type="button" data-id="${data.id}" data-action="delete" class="text-[#fff] bg-[#ff2525] border-1 border-[#ff3908c0] flex-1 px-[1rem] py-[0.3rem] rounded-[5px] font-[600] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">Delete</button>
          </div>
  `

  main.appendChild(card);
};

main.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  const action = target.dataset.action;
  const id = target.dataset.id

  if (!action || !id) return;

  const post = posts.find(post => post.id === id)

  if (!post) return;

  if (action === "update") {
    openUpdateModal(post);
  }

  if (action === "delete") {
    showModal("confirm");
    confirmDeleteBtn.dataset.id = id;
    confirmDeleteBtn.addEventListener("click", () => deletePost(id));
  }
});

descriptionTextarea.addEventListener("input", () => updateDescriptionCounter());

function openUpdateModal(post: Post) {
  ModalWrapper.hidden = false;
  Modal.hidden = false;
  previewImageContainer.hidden = false;

  Modal.dataset.mode = "update"
  Modal.dataset.id = post.id

  titleInput.value = post.title;
  descriptionTextarea.value = post.description;

  imageInput.required = false;
  uploadImgHint.textContent = "(optional - to replace)";

  updateDescriptionCounter();
  modalTitle.textContent = "Edit Post";
  saveBtn.textContent = "Update";

  if (previewImage) {
    previewImage.src = post.imageUrl;
  }
};

function renderAllPosts(data: Post[]) {
  main.innerHTML = "";

  data.forEach((post) => {
    renderPost(post);
  })

};

export function showModal(type: string) {
  if (type === "new") {
    ModalWrapper.hidden = false;
    Modal.hidden = false;
    previewImageContainer.hidden = true;
    imageInput.required = true;

    titleInput.value = "";
    descriptionTextarea.value = "";
    uploadImgHint.textContent = "(required)";

    updateDescriptionCounter();
    Modal.dataset.mode = "new"
    delete Modal.dataset.id
  } else {
    ConfirmModalWrapper.hidden = false;
    ConfirmModal.hidden = false;
  }
};

export function closeModal() {
  ModalWrapper.hidden = true;
  Modal.hidden = true;
  ConfirmModalWrapper.hidden = true;
  ConfirmModal.hidden = true;

  previewImage.src = "";
  previewImageContainer.hidden = true;

  updateDescriptionCounter();

  modalTitle.textContent = "New Post";
};

function loading(state: boolean) {
  if (state) {
    loadingContainer.hidden = false;
  } else {
    loadingContainer.hidden = true;
  }
};

function updateDescriptionCounter() {
  descriptionCounter.textContent = descriptionTextarea.value.length.toString();
};

function toggleButtonLoading(
  button: HTMLButtonElement,
  state: boolean,
  loadingText: string,
  defaultText: string
) {
  if (state) {
    button.disabled = true;
    button.textContent = loadingText;
  } else {
    button.disabled = false;
    button.textContent = defaultText;
  }
};

export async function getAllData() {
  try {
    loading(true);
    const { data } = await api.get("/posts");

    posts.length = 0;
    posts.push(...data.data)

    loading(false);
    renderAllPosts(posts);

  } catch (error) {

    console.error(error)
    loading(false);

  } finally {
    loading(false);
  }
};

export async function updatePost(id : string, body : FormData) {
    try {
      toggleButtonLoading(saveBtn, true, "Updating...", "Update");
      const { data } = await api.put(
        `/posts/${id}`,
        body,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log(data)
      return data;
      
    } catch (error) {
      console.error(error)
    } finally {
      toggleButtonLoading(saveBtn, false, "Updating...", "Update");
    }
};

export async function addNewPost(formData: FormData) {
  try {
    toggleButtonLoading(saveBtn, true, "Saving...", "Save");
    const { data } = await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });

    console.log(data);
  } catch (error) {
    console.error(error)
  } finally {
    toggleButtonLoading(saveBtn, false, "Saving...", "Save");
  }
};

export async function deletePost(id: string) {
  try {
    toggleButtonLoading(confirmDeleteBtn, true, "Deleting...", "Delete");

    await api.delete(`/posts/${id}`);
    closeModal();

    getAllData();

  } catch (error) {
    console.error(error)
  } finally {
    toggleButtonLoading(confirmDeleteBtn, false, "Deleting...", "Delete");
  }
};