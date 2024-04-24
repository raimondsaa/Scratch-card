const express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', 'views');
app.set('view engine', 'ejs');

const items = new Array(9);

function readUsersJson() {
	users = fs.readFileSync('public/users.json', 'utf-8');
	if (users == '') {
		userArray = [];
	} else {
		userArray = JSON.parse(users);
	}
	return userArray;
}
userArray = readUsersJson();

function getTimeDifferenceInMinutes(date1, date2) {
	const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
	const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
	return differenceInMinutes;
}
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

app.post('/api/sakt', (req, res) => {
	// console.log(req.body);
	const COOLDOWN = 5;
	userArray = readUsersJson();
	if (!isValidEmail(req.body.email)) {
		console.log('not a valid email');
		return res.send({ type: '!email' });
	}
	var currentTime = new Date();
	for (u in userArray) {
		// Goes trough all of the emails
		// console.log(userArray[u].email, req.body.email);
		if (userArray[u].email == req.body.email) {
			// checks if email is registered
			oldStartDate = new Date(userArray[u].startDateTime);
			if (getTimeDifferenceInMinutes(oldStartDate, currentTime) < COOLDOWN) {
				if (req.body.allowCookies == 'true') {
					res.cookie('email', req.body.email);
				}
				var secondsLeft = parseInt(
					COOLDOWN * 60 - Math.abs(oldStartDate.getTime() - currentTime.getTime()) / 1000,
				);
				return res.send({ type: 'wait', time: secondsLeft });
			}
			if (!bcrypt.compareSync(req.body.psw, userArray[u].password)) {
				return res.send({ type: 'credentials' });
			}
			console.log('Starting to create game');
			result = setItems();
			const { items, winnerImage } = result;
			// console.log("the games items:", items);
			// console.log("winnerImage no funkcijas:", winnerImage);
			userArray[u] = {
				...userArray[u],
				startDateTime: currentTime,
				winner: winnerImage,
				items: items,
			};
			const userArrayJson = JSON.stringify(userArray);
			fs.writeFile('public/users.json', userArrayJson, (err) => {
				if (err) {
					throw err;
				}
				console.log('User updated');
			});
			if (req.body.allowCookies == 'true') {
				res.cookie('email', req.body.email);
			}
			return res.send({ type: 'ok', items: items });
		}
	}
	return res.send({ type: '!registered' });
});

app.post('/api/sanemtPazinojumu', (req, res) => {
	// console.log(req.body);
	for (u in userArray) {
		// console.log(userArray[u].email, req.body.email);
		if (userArray[u].email == req.body.email) {
			if (userArray[u].winner != 'unlucky.jpeg') {
				return res.send({ id: 0, message: 'UZVARA!!!!', image: userArray[u].winner });
			}
			return res.send({ id: 1, message: 'Zaudējums...', image: userArray[u].winner });
		}
	}
	return res.send({ id: 2, message: 'Necenties apkrāpt mani!', image: userArray[u].winner });
});

function readImagePaths() {
	const itemPath = path.join(__dirname, '/public/images/items');
	try {
		const files = fs.readdirSync(itemPath);
		const imageFiles = files.filter((file) => {
			const ext = path.extname(file).toLowerCase();
			return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
		});
		return imageFiles;
	} catch (err) {
		console.error('Error reading directory:', err);
		return null;
	}
}
const imageFiles = readImagePaths();

function setItems() {
	var usedItems = imageFiles.map((file) => {
		const fileName = path.basename(file);
		const count = 0;
		return [fileName, count];
	});
	winner = false;
	if (Math.floor(Math.random() * 4) == 0) {
		winner = true;
	}
	items.fill(undefined);
	var winnerItemIdxs = [];
	// Read files from the directory
	// console.log('Image files:', usedItems);
	const imageCount = usedItems.length;
	if (winner) {
		console.log('Uzvarēja!');
		var winnerImageIdx = Math.floor(Math.random() * imageCount);
		var winnerImage = usedItems[winnerImageIdx][0];
		// console.log('Winner image:', winnerImage);
		for (let i = 0; i < 3; i++) {
			do {
				var randomIdx = Math.floor(Math.random() * items.length);
				// console.log(randomIdx);
			} while (items[randomIdx] != undefined);
			// console.log(randomIdx, "item ir", winnerImage)
			winnerItemIdxs.push(randomIdx);
			items[randomIdx] = winnerImage;
			usedItems[winnerImageIdx][1] += 1;
		}
		winnerImage = '/items/' + winnerImage;
	} else {
		var winnerImage = 'unlucky.jpeg';
		console.log('Zaudēja');
	}
	for (let i = 0; i < items.length; i++) {
		do {
			var randomIdx = Math.floor(Math.random() * imageCount);
		} while (usedItems[randomIdx][1] >= 2);
		if (items[i] === undefined) {
			items[i] = usedItems[randomIdx][0];
			usedItems[randomIdx][1] += 1;
		}
	}
	// console.log("Funkcija izdod:", items);
	// console.log(usedItems);
	return { items, winnerImage };
	// console.log(items);
}

app.get('/', (req, res) => {
	var userEmail = '';
	if (req.cookies.email) {
		userEmail = req.cookies.email;
	}
	res.render('index', {
		email: userEmail,
	});
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	console.log(req.body);
	const email = req.body.email;
	const psw = req.body.psw;
	const pswRepeat = req.body.pswRepeat;
	console.log(email);
	if (!isValidEmail(email)) {
		return res.send({ type: '!email' });
	}
	userArray = readUsersJson();
	for (u in userArray) {
		// console.log(userArray[u].email, req.body.email);
		if (userArray[u].email == req.body.email) {
			return res.send({ type: 'exists' });
		}
	}
	if (psw !== pswRepeat) {
		return res.send({ type: 'pw!=pwRepeat' });
	}
	registerUser(email, psw);
	res.cookie('email', req.body.email);
	return res.send({ type: 'ok' });
	//   res.render('index', {
	//     email: email,
	// })

	console.log('Form submitted:', { email, psw, pswRepeat });
});

function registerUser(email, password) {
	userArray = readUsersJson();
	hashedPsw = hashPassword(password);
	userArray.push({ ID: userArray.length, email: email, password: hashedPsw, verified: false });
	const userArrayJson = JSON.stringify(userArray);
	fs.writeFile('public/users.json', userArrayJson, (err) => {
		if (err) {
			throw err;
		}
		console.log('New user saved');
	});
}

function hashPassword(password) {
	const saltRounds = 10;
	const salt = bcrypt.genSaltSync(saltRounds);
	const hashedPassword = bcrypt.hashSync(password, salt);
	return hashedPassword;
}

app.listen(3000, () => {
	console.log('Serveris sācis darboties, darbojos uz 3000 porta');
});
