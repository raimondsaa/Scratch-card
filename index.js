const express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const fs = require('fs');
const app = express();


const items = new Array(9);

app.use('/public', express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ extended: false }));


app.set('views', 'views');
app.set('view engine', 'ejs');

function readGamesJson(){
  fs.readFile('public/games.json', 'utf-8', (err, games) => {
    if (err) {
      throw err;
    } else {
      // console.log("games:", games)
      if(games == ''){
        gameArray = [];
      }else{
        gameArray = JSON.parse(games);
      }
    }
  });
}
readGamesJson();

function getTimeDifferenceInMinutes(date1, date2) {
  // Calculate the difference in milliseconds
  const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  // Convert milliseconds to minutes
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

  return differenceInMinutes;
}

app.post('/api/sakt', (req, res) => {
  const COOLDOWN = 1;
  readGamesJson();
  console.log(req.body);
  var currentTime = new Date(); 
  canPlay = true;
  gameID = -1;
  winner = false;
	for (g in gameArray) {
    // console.log(gameArray[g].email, req.body.email);
		if (gameArray[g].email == req.body.email) {
      console.log("email jau eksiste");
      gameID = g;
      oldStartDate = new Date(gameArray[g].startDateTime);
     if(getTimeDifferenceInMinutes(oldStartDate, currentTime) < COOLDOWN){
        canPlay = false;
      }
		}
	}
	if(canPlay){
    setItems()
      .then((items) => {

        if(Math.floor(Math.random() * 4) == 0){
          winner = true;
        }
        if(gameID == -1){
          gameID = gameArray.length +1;
          gameArray.push({"ID": gameID, "email": req.body.email, "startDateTime": currentTime, "winner": winner, "items":items});
        }else{
          gameArray[gameID] = {"ID": gameID,  "email": req.body.email, "startDateTime": currentTime, "winner": winner, "items":items};
        }
        const gameArrayJson = JSON.stringify(gameArray);
        fs.writeFile('public/games.json', gameArrayJson, (err) => {
          if (err) {
            throw err;
          }
          console.log("New games saved");
        });
        // console.log(JSON.stringify([{items: items}]));
        res.send(JSON.stringify([{items: items}]));
        // res.end();

        // const data = {items:items };
        // res.json(data);
      })
      .catch((error) => {
          console.error('Error fetching data:', error);
      });
  }else{
    console.log("Šāds email jau eksistē un pildīja pirms mazāk kā minūtes");
    // const data = {items:[] };
    //     res.json(data);
    res.end();
  }
  
});

app.post('/api/sanemtPazinojumu', (req, res) => {
  if(winner){
    res.send(JSON.stringify([{"id":0,"zina":"UZVARA!!!!"}]));
  }else{
    res.send(JSON.stringify([{"id":1,"zina":"Zaudējums..."}]));
  }
	res.end();
});


function setItems(){
  return new Promise((resolve, reject) => {
    winner = false;
    if(Math.floor(Math.random() * 4) == 0){
      winner = true;
    }
    items.fill(undefined);
    var winnerItemIdxs = [];
    const itemPath = path.join(__dirname, '/public/images/items') ;
  // Read files from the directory
    fs.readdir(itemPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        // Filter image files (you can adjust this filter based on your requirements)
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        }).map(file => {
          const fileName = path.basename(file);
          const count = 0;
          return [fileName, count];
      });
        // console.log('Image files:', imageFiles);
        const imageCount = imageFiles.length;
        if(winner){
          console.log("Uzvarēja!");
          var winnerImageIdx = Math.floor(Math.random() * imageCount);
          var winnerImage = imageFiles[winnerImageIdx][0];
          // console.log('Winner image:', winnerImage);
          for(let i = 0; i < 3; i++){
            do{
              var randomIdx = Math.floor(Math.random() * items.length);
              // console.log(randomIdx);
            }while(items[randomIdx] != undefined);
            console.log(randomIdx, "item ir", winnerImage)
            winnerItemIdxs.push(randomIdx);
            items[randomIdx] = winnerImage;
            imageFiles[winnerImageIdx][1] += 1;
          }
        }else{
          console.log("Zaudēja");
        }
        for(let i = 0; i < items.length; i++){
          do{
          var randomIdx = Math.floor(Math.random() * imageCount);
        }while(imageFiles[randomIdx][1]>=2);
          if(items[i] === undefined){
            items[i] = imageFiles[randomIdx][0];
            imageFiles[randomIdx][1] += 1;
          }
        }
        // console.log("Funkcija izdod:", items);
        // console.log(imageFiles);
        resolve(items);
        // console.log(items);
    });
  });
  
}




app.get('/data', (req, res) => {
  readGamesJson();
  var canPlay = true;
  for (g in gameArray) {
    // console.log(gameArray[g].email, req.body.email);
		if (gameArray[g].email == req.body.email) {
      console.log("email jau eksiste");
      emailID = g;
      oldStartDate = new Date(gameArray[g].startDateTime);
      // console.log(oldStartDate, currentTime);
      // console.log("minutes",getTimeDifferenceInMinutes(oldStartDate, currentTime));
      if(getTimeDifferenceInMinutes(oldStartDate, currentTime) < 5){
        canPlay = false;
      }
		}
	}
  if(canPlay){
    setItems()
      .then((items) => {
        const data = {items:items };
        res.json(data);
      })
      .catch((error) => {
          console.error('Error fetching data:', error);
      });
  }else{
    const data = {items:[] };
        res.json(data);
  }

  
 });
app.get('/', (req, res) => {

        res.render('index', { 
          title: 'Skape vai Laime', 
          message: 'Šis ir teksts, kuru parāda kā mainīgo', 
          // columnCount: columnCount, 
          // rowCount: rowCount 
      })
      
});
   
    


app.listen(3000, () => {
	console.log('Serveris sācis darboties, darbojos uz 3000 porta');
});