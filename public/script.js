const scrathLayer = new Image();
scrathLayer.src = '/public/images/scratch-layer.png';
function saktSpeli() {
	gotAlert = false;
	// console.log("items:", items);
	for (let i = 0; i < 9; i++) {
		var imageContainer = document.getElementById('item' + (i + 1));
		imageContainer.innerHTML = '';
		var img = document.createElement('img');
		img.src = '/public/images/items/' + items[i];
		img.alt = items[i];
		imageContainer.appendChild(img);
	}

	document.getElementById('backgroundImage').src = '/public/images/Dena.png';

	let canvas = document.getElementById('scratch');
	let context = canvas.getContext('2d');

	fieldWidth = canvas.clientWidth;
	fieldHeight = canvas.clientHeight;
	// const rowCount = 3;
	// const columnCount = 3;
	const init = () => {
		// let gradientColor = context.createLinearGradient(0, 0, 135, 135);
		// gradientColor.addColorStop(0, "#c3a3f1");
		// gradientColor.addColorStop(1, "#6414e9");
		// context.fillStyle = gradientColor;
		// context.fillRect(0, 0, fieldWidth , fieldHeight);

		context.drawImage(scrathLayer, 0, 0, canvas.width, canvas.height);
		context.save();
	};
	context.restore();

	//initially mouse X and mouse Y positions are 0
	let mouseX = 0;
	let mouseY = 0;
	let isDragged = false;

	//Events for touch and mouse
	let events = {
		mouse: {
			down: 'mousedown',
			move: 'mousemove',
			up: 'mouseup',
		},
		touch: {
			down: 'touchstart',
			move: 'touchmove',
			up: 'touchend',
		},
	};

	let deviceType = '';

	//Detech touch device
	const isTouchDevice = () => {
		try {
			//We try to create TouchEvent. It would fail for desktops and throw error.
			document.createEvent('TouchEvent');
			deviceType = 'touch';
			return true;
		} catch (e) {
			deviceType = 'mouse';
			return false;
		}
	};

	//Get left and top of canvas
	let rectLeft = canvas.getBoundingClientRect().left;
	let rectTop = canvas.getBoundingClientRect().top;
	window.addEventListener('resize', () => {
		rectTop = canvas.getBoundingClientRect().top;
		rectLeft = canvas.getBoundingClientRect().left;
	});
	//Exact x and y position of mouse/touch
	const getXY = (e) => {
		mouseX = (!isTouchDevice() ? e.pageX : e.touches[0].pageX) - rectLeft;
		mouseY = (!isTouchDevice() ? e.pageY : e.touches[0].pageY) - rectTop;
	};

	isTouchDevice();
	//Start Scratch
	canvas.addEventListener(events[deviceType].down, (event) => {
		isDragged = true;
		//Get x and y position
		getXY(event);
		scratch(mouseX, mouseY);
	});

	//mousemove/touchmove
	canvas.addEventListener(events[deviceType].move, (event) => {
		if (!isTouchDevice()) {
			event.preventDefault();
		}
		if (isDragged) {
			getXY(event);
			scratch(mouseX, mouseY);
		}
	});

	//stop drawing
	canvas.addEventListener(events[deviceType].up, () => {
		isDragged = false;
	});

	//If mouse leaves the square
	canvas.addEventListener('mouseleave', () => {
		isDragged = false;
	});

	document.addEventListener('mousedown', () => {
		isDraggedOutside = true;
	});
	document.addEventListener('mouseup', () => {
		isDraggedOutside = false;
	});

	canvas.addEventListener('mouseover', () => {
		if (typeof isDraggedOutside != 'undefined') {
			isDragged = isDraggedOutside;
		}
	});

	function isBetween(number, min, max) {
		return number > min && number < max;
	}
	const seenItems = new Array(9).fill(false);
	var seenImages = [];
	const scratch = (x, y) => {
		//destination-out draws new shapes behind the existing canvas content
		context.globalCompositeOperation = 'destination-out';
		context.beginPath();
		//arc makes circle - x,y,radius,start angle,end angle
		context.arc(x, y, 12, 0, 2 * Math.PI);
		context.fill();

		if (!gotAlert) {
			var currentItem = 0;
			for (var currentRow = 0; currentRow < 3; currentRow++) {
				var row = isBetween(
					y,
					(fieldHeight * currentRow) / 3 + 20,
					(fieldHeight * (currentRow + 1)) / 3 - 20,
				);
				// console.log("y:",y,"ir starp",fieldHeight * currentRow/3, fieldHeight * (currentRow+1)/3)
				for (var currentColumn = 0; currentColumn < 3; currentColumn++) {
					// console.log("x:",x,"ir starp",fieldHeight * currentRow/3, fieldHeight * (currentRow+1)/3)
					var column = isBetween(
						x,
						(fieldWidth * currentColumn) / 3 + 20,
						(fieldWidth * (currentColumn + 1)) / 3 - 20,
					);
					// console.log(currentRow, currentColumn);
					// console.log(row, column);
					if (!seenItems[currentItem] && row && column) {
						seenItems[currentItem] = true;
						var thisImage = items[currentItem];
						let exists = false;
						for (let i = 0; i < seenImages.length; i++) {
							if (seenImages[i][0] === thisImage) {
								exists = true;
								seenImages[i][1] += 1;
								if (seenImages[i][1] == 3 && !gotAlert) {
									sanemtPazinojumu();
								}
								break;
							}
						}
						if (!exists) {
							seenImages.push([thisImage, 1]);
						}
						console.log('Atklāts lauciņš nr.', currentItem);
						if (seenItems.every((element) => element == true) && !gotAlert) {
							sanemtPazinojumu();
						}
					}
					currentItem += 1;
				}
			}
		}
	};
	window.onload = init();
}

//Alerts
function showCustomAlert(imageUrl, message) {
	const imageDiv = document.createElement('div');
	imageDiv.className = 'custom-alert-image';
	var imageUrl = '/public/images/' + imageUrl; // Replace with your image URL
	const imageElement = document.createElement('img');
	imageElement.src = imageUrl;
	imageDiv.appendChild(imageElement);

	const title = document.createElement('h2');
	title.textContent = message;

	const alertDiv = document.createElement('div');
	alertDiv.className = 'custom-alert';
	alertDiv.appendChild(title);
	alertDiv.appendChild(imageDiv);
	document.body.appendChild(alertDiv);

	alertDiv.addEventListener('click', function (event) {
		event.target.closest('.custom-alert').remove();
	});
}
function removeAlerts() {
	document.querySelectorAll('.custom-alert').forEach((element) => {
		element.remove();
	});
}

// COOKIES
function getCookie(name) {
	const cookies = document.cookie.split('; ');
	for (let cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split('=');
		if (cookieName === name) {
			return decodeURIComponent(cookieValue);
		}
	}
	return false;
}
if (!getCookie('allowCookies')) {
	modal = document.getElementById('cookieModal');
	window.onload = function () {
		modal.style.display = 'block';
	};
	function acceptCookies() {
		document.cookie = 'allowCookies=true';
		allowCookies = true;
		console.log('Cookies accepted');
		modal.style.display = 'none';
	}
	function denyCookies() {
		allowCookies = false;
		console.log('Cookies denied');
		modal.style.display = 'none';
	}
}
