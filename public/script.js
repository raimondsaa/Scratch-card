// const rowCount = 3;
// const columnCount = 3;
// var win = false;
// fetch('data')
//     .then(response => response.json())
//     .then(data => {
//         console.log("data",data); 
//         const rowCount = data.rowCount;
//         const columnCount = data.columnCount;
//         const items = data.items;
//         console.log(rowCount, columnCount, items);
    
function scrape(){
  init();
  console.log("items:", items);
  for(let i = 0; i < 9;i++){
    var imageContainer = document.getElementById('item'+(i+1));
    imageContainer.innerHTML = '';
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
  const seenItems = new Array(9).fill(false);
  var seenImages = [];
  const scratch = (x, y) => {
      var currentItem = 0;
      for (var currentRow = 0; currentRow < 3; currentRow++) {
          var row = isBetween(y, fieldHeight * currentRow/3, fieldHeight * (currentRow+1)/3);
          // console.log("y:",y,"ir starp",fieldHeight * currentRow/3, fieldHeight * (currentRow+1)/3)
          for (var currentColumn = 0; currentColumn < 3; currentColumn++) {
              // console.log("x:",x,"ir starp",fieldHeight * currentRow/3, fieldHeight * (currentRow+1)/3)
              var column = isBetween(x, fieldWidth * currentColumn/3, fieldWidth * (currentColumn+1)/3);
              // console.log(currentRow, currentColumn);
              // console.log(row, column);
              if(!seenItems[currentItem] && row && column){
                  seenItems[currentItem] = true;
                  var thisImage = items[currentItem];
                  let exists = false;
                  for (let i = 0; i < seenImages.length; i++) {
                      if (seenImages[i][0] === thisImage) {
                          exists = true;
                          seenImages[i][1] += 1;
                          if(seenImages[i][1] == 3){
                            win = true;
                            alert("Uzvara!!!");// Jāaizvieto ar funkciju no servera, kas alertos uzvar vai zaudē
                          }
                          break;
                      }
                  }
                  if (!exists) {
                    seenImages.push([thisImage, 1]);
                  }
                  console.log("Atklāts lauciņš nr.", currentItem);
                  if(seenItems.every(element => element == true) && !win){
                    alert("Zaudējums!");// Jāaizvieto ar funkciju no servera, kas alertos uzvar vai zaudē
                  }
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

}
// })
// .catch(error => console.error('Error fetching data:', error));

