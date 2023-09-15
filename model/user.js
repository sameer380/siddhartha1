const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		default: null,
	},
	lastName: {
		type: String,
		default: null,
	},
	email: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
	},
});

module.exports = mongoose.model("CollegeUser", userSchema);
