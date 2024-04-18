const rowCount = 3;
const columnCount = 3;
fetch('/data')
    .then(response => response.json())
    .then(data => {
        console.log("data",data); 
        const rowCount = data.rowCount;
        const columnCount = data.columnCount;
        const items = data.items;
        console.log(rowCount, columnCount, items);
    

for(let i = 0; i < rowCount*columnCount;i++){
  var imageContainer = document.getElementById('item'+(i+1));
  var img = document.createElement('img');
  img.src = '/public/images/items/'+items[i];
  img.alt = items[i];
  imageContainer.appendChild(img);
}

let canvas = document.getElementById("scratch");
let context = canvas.getContext("2d");

fieldWidth = canvas.clientWidth;
fieldHeight = canvas.clientHeight;
// const rowCount = 3;
// const columnCount = 3;

const init = () => {
  let gradientColor = context.createLinearGradient(0, 0, 135, 135);
  gradientColor.addColorStop(0, "#c3a3f1");
  gradientColor.addColorStop(1, "#6414e9");
  context.fillStyle = gradientColor;
  context.fillRect(0, 0, fieldWidth , fieldHeight);
};

//initially mouse X and mouse Y positions are 0
let mouseX = 0;
let mouseY = 0;
let isDragged = false;

//Events for touch and mouse
let events = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
    up: "mouseup",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
  },
};

let deviceType = "";

//Detech touch device
const isTouchDevice = () => {
  try {
    //We try to create TouchEvent. It would fail for desktops and throw error.
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

//Get left and top of canvas
let rectLeft = canvas.getBoundingClientRect().left;
let rectTop = canvas.getBoundingClientRect().top;

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
canvas.addEventListener("mouseleave", () => {
  isDragged = false;
});

function isBetween(number, min, max) {
    return number > min && number < max;
  }

const seenItems = new Array(rowCount*columnCount).fill(false);

const scratch = (x, y) => {
    var currentItem = 0;
    for (var currentRow = 0; currentRow < rowCount; currentRow++) {
        var row = isBetween(y, fieldHeight * currentRow/rowCount, fieldHeight * (currentRow+1)/rowCount);
        // console.log("y:",y,"ir starp",fieldHeight * currentRow/rowCount, fieldHeight * (currentRow+1)/rowCount)
        for (var currentColumn = 0; currentColumn < rowCount; currentColumn++) {
            // console.log("x:",x,"ir starp",fieldHeight * currentRow/rowCount, fieldHeight * (currentRow+1)/rowCount)
            var column = isBetween(x, fieldWidth * currentColumn/columnCount, fieldWidth * (currentColumn+1)/columnCount);
            // console.log(currentRow, currentColumn);
            // console.log(row, column);
            if(!seenItems[currentItem] && row && column){
                seenItems[currentItem] = true;
                console.log("Atklāts lauciņš nr.", currentItem);
            }
            currentItem += 1;
        }
    }
  //destination-out draws new shapes behind the existing canvas content
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  //arc makes circle - x,y,radius,start angle,end angle
  context.arc(x, y, 12, 0, 2 * Math.PI);
  context.fill();
};

window.onload = init();


})
.catch(error => console.error('Error fetching data:', error));