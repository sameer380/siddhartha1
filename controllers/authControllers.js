const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UploadModel = require("../model/uploadModel");
const USER = require("../model/user"); // Import your User model





const registerUser = async (req, res) => {
	try {
		// Get all data from the request body

		const { firstName, lastName, email, password } = req.body;

		if (!(firstName && lastName && email && password)) {
			return res.status(400).json({ error: "All fields are compulsory" });
		}

		USER.findOne({ email: email } || { password: password }).then(
			(existingUser) => {
				if (existingUser) {
					return res.status(422).json({
						error: "User already exists with that email or roll number",
					});
				}
				// console.log(firstName, lastName, email, password);
				bcrypt.hash(password, 12).then((hashedPassword) => {
					const user = new USER({
						firstName: firstName,
						lastName: lastName,
						email: email,
						password: hashedPassword,
					});

					user
						.save()
						.then((user) => {
							console.log(user);
							res.json({ message: "Saved successfully" });
						})
						.catch((err) => {
							console.log(err);
							res.status(500).json({ error: "Could not save user" });
						});
				});
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred during registration" });
	}
};   
const login = async (req, res) => {
	const { email, password } = req.body;
	console.log(email);
	console.log([password]);
	if (!email || !password) {
		return res.status(422).json({ error: "Please provide email and Rollno" });
	}

	USER.findOne({ email: email })
		.then((savedUser) => {
			if (!savedUser.email) {
				return res.status(422).json({ error: "Invalid email" });
			}

			if (!savedUser.password) {
				return res.status(500).json({ error: "User Roll-Number not found" });
			}

			bcrypt
				.compare(password, savedUser.password)
				.then((match) => {
					if (match) {
						const token = jwt.sign({ _id: savedUser.id }, "sasass");
						const { firstName, lastName, email, userName } = savedUser;
						res.json({
							token,
							user: { firstName, lastName, email, userName },
						});
					} else {
						return res
							.status(422)
							.json({ error: "User Roll-Number not found" });
					}
				})
				.catch((err) => {
					console.log(err);
					return res
						.status(500)
						.json({ error: "Error comparing Roll Numbers" });
				});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: "User Not Found, Signup before login" });
		});
};


const order = async (req, res) => {
	const allPhotos = await UploadModel.find().sort({ createdAt: "descending" });
	res.send(allPhotos);
}

const upload= (req, res) => {
	const photo = req.file.filename;

	console.log(photo);

	UploadModel.create({ photo })
		.then((data) => {
			console.log("Uploaded Successfully...");
			console.log(data);
			res.send(data);
		})
		.catch((err) => console.log(err));
};



module.exports = {
	login,
	registerUser,
	upload,
	order,

};
