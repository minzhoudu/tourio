import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateInfo } from "./updateSettings";
import { bookTour } from "./stripe";
import { showAlert } from "./alerts";

// DOM Elements

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateDataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const imageUpload = document.getElementById("imageUpload");
const bookTourButton = document.getElementById("book-tour");
const alertMsg = document.querySelector("body").dataset.alert;

// Delegations

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const email = formData.get("email");
        const password = formData.get("password");

        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

if (updateDataForm) {
    updateDataForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(updateDataForm);
        updateInfo(formData, "data");
    });
}

if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        document.querySelector(".btn--save-password").textContent = "Updating...";

        const formData = new FormData(passwordForm);
        const currentPassword = formData.get("currentPassword");
        const password = formData.get("password");
        const passwordConfirm = formData.get("passwordConfirm");

        await updateInfo({ currentPassword, password, passwordConfirm }, "password");

        document.querySelector(".btn--save-password").textContent = "Save password";
        document.getElementById("password-current").value = "";
        document.getElementById("password").value = "";
        document.getElementById("password-confirm").value = "";
    });
}

if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
        const fileName = e.target.files[0].name;

        const output = document.querySelector(".upload-file-name");
        output.innerHTML = fileName;
    });
}

if (bookTourButton) {
    bookTourButton.addEventListener("click", (e) => {
        e.target.textContent = "Processing Payment...";

        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}

if (alertMsg) {
    showAlert("success", alertMsg, 15);
}
