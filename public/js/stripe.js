import axios from "axios";
import Stripe from "stripe";
import { showAlert } from "./alerts";

Stripe("pk_test_51MxeH9BADQDNOKj9p2qdL4gxHnpL0KM9papxwyThGS3cMCEpa2sstWN1ZgpoAB4cn45Mq1QlPpCAiaD4r65VS6zl000jeqgeL3");

export const bookTour = async (tourID) => {
    try {
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourID}`);
        debugger;
        window.location.replace(session.data.session.url);
    } catch (error) {
        showAlert("error", error);
    }
};
