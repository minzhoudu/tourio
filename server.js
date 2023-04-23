//sync unhandled errors
process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXEPTION! 💥 SHUTTING DOWN");
    process.exit(1);
});
// example console.log(x) where x is not defined

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

//? local database
// mongoose.connect(process.env.DB_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
// });

// ?atlas database
let url = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose
    .connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then((connection) => {
        console.log("DB Connection established");
    });

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});

//only async unhandled errors
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION! 💥 SHUTTING DOWN");
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("SIGTERM RECIEVED. Shutting down!!!");
    server.close(() => {
        console.log("💥 Process Terminated!");
    });
});
