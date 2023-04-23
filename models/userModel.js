const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { Schema, model } = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        require: "Email address is required",
        validate: [isEmail, "invalid email address"],
    },
    photo: {
        type: String,
        default: "default.jpg",
    },
    role: {
        type: String,
        enum: {
            values: ["user", "guide", "lead-guide", "admin"],
            message: "Wrong value type",
        },
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                var a = this.get("password");
                var aa = this.password;
                return el === this.password;
            },
            message: "Passwords don't match",
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
});

//! //////////////////////// MIDDLEWARE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

userSchema.pre("save", async function (next) {
    //if password field is not modified, jump to the next middleware
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    if (this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;

    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

//! /////////////////////// MODEL METHODS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
userSchema.methods.passwordOk = async function (password, DBpasasword) {
    return await bcrypt.compare(password, DBpasasword);
};

userSchema.methods.passwordChangedAfterJWT = function (JWTTimestamp) {
    if (!this.passwordChangedAt) return false;

    const changedPasswordTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedPasswordTimestamp;
};

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    this.save({ validateBeforeSave: false });

    return resetToken;
};

module.exports = model("Users", userSchema);
