import axios from "axios";
import { showAlert } from "./alerts";

//Function for updating eather data(email, name etc..) or password.
export const updateInfo = async (data, type) => {
    const saveBtn = document.getElementById("btn-saveSettings");
    try {
        saveBtn.innerText = "Saving your changes...";

        const url = type === "password" ? "http://127.0.0.1:3000/api/v1/users/updatePassword" : "http://127.0.0.1:3000/api/v1/users/updateInfo";
        const updatedUser = await axios({
            method: "PATCH",
            url,
            data,
        });

        if (updatedUser.data.status === "success") {
            saveBtn.innerText = "Save Settings";
            showAlert("success", `${type.toUpperCase()} successfully updated!`);

            setTimeout(() => {
                location.reload();
            }, 5000);
        }
    } catch (error) {
        saveBtn.innerText = "Save Settings";
        showAlert("error", error.response.data.message);
    }
};
