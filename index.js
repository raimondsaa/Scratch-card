const express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', 'views');
app.set('view engine', 'ejs');

const items = new Array(9);


app.get('/read-cookie', (req, res) => {
  const username = req.cookies.username;
  res.send(`Hello ${username}`);
});

function readUsersJson(){
  users = fs.readFileSync('public/users.json', 'utf-8');
  if(users == ''){
    userArray = [];
  }else{
    userArray = JSON.parse(users);
  }
}

readUsersJson();

function getTimeDifferenceInMinutes(date1, date2) {
  // Calculate the difference in milliseconds
  const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  // Convert milliseconds to minutes
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

  return differenceInMinutes;
}
function isValidEmail(email) {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
app.post('/api/sakt', (req, res) => {
  if(!isValidEmail(req.body.email)){
    return res.send("!email");
  }

  const COOLDOWN = 5;
  readUsersJson();
  // console.log(req.body);
  var currentTime = new Date(); 
  canPlay = true;
  userID = -1;
  winner = false;
	for (u in userArray) {
    // console.log(userArray[u].email, req.body.email);
		if (userArray[u].email == req.body.email) {
      console.log("email jau eksiste");
      userID = u;
      oldStartDate = new Date(userArray[u].startDateTime);
     if(getTimeDifferenceInMinutes(oldStartDate, currentTime) < COOLDOWN){
        canPlay = false;
      }
		}
	}
	if(canPlay){
    setItems()
      .then((result) => {
        const { items, winnerImage} = result;
        console.log("winnerImage no funkcijas:", winnerImage);
        if(Math.floor(Math.random() * 4) == 0){
          winner = true;
        }
        if(userID == -1){
          userID = userArray.length +1;
          userArray.push({"ID": userID, "email": req.body.email, "startDateTime": currentTime, "winner": winnerImage, "items":items});
        }else{
          userArray[userID] = {"ID": userID,  "email": req.body.email, "startDateTime": currentTime, "winner": winnerImage, "items":items};
        }
        const userArrayJson = JSON.stringify(userArray);
        fs.writeFile('public/users.json', userArrayJson, (err) => {
          if (err) {
            throw err;
          }
          console.log("New user saved");
        });
        // console.log(JSON.stringify([{items: items}]));
        res.cookie('email', req.body.email, { secure:true});
        return res.send(JSON.stringify([{items: items}]));
      })
      .catch((error) => {
          console.error('Error fetching data:', error);
      });
  }else{
    console.log("Šāds email jau eksistē un pildīja pirms mazāk kā minūtes");
    console.log("Jāgaida vēl ",COOLDOWN*60 - Math.abs(oldStartDate.getTime() - currentTime.getTime())/1000, " sekundes");
    // const data = {items:[] };
    //     res.json(data);
    res.cookie('email', req.body.email, {secure:true});
    return res.send("wait");
  }
  
});

app.post('/api/sanemtPazinojumu', (req, res) => {
  // console.log(req.body);
  for (u in userArray) {
    // console.log(userArray[u].email, req.body.email);
		if (userArray[u].email == req.cookies.email) {
      if(userArray[u].winner != "unlucky.jpeg"){
        return res.send(JSON.stringify([{"id":0,"message":"UZVARA!!!!", "image": userArray[u].winner}]));
      }
      return res.send(JSON.stringify([{"id":1,"message":"Zaudējums...", "image": userArray[u].winner}]));
		}
  }
  return res.send(JSON.stringify([{"id":2,"message":"Necenties apkrāpt mani!", "image": userArray[u].winner}]));
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
          winnerImage = '/items/'+ winnerImage;
        }else{
          var winnerImage = 'unlucky.jpeg';
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
        resolve({items, winnerImage});
        // console.log(items);
    });
  });
  
}




app.get('/data', (req, res) => {
  readUsersJson();
  var canPlay = true;
  for (u in userArray) {
    // console.log(userArray[g].email, req.body.email);
		if (userArray[u].email == req.body.email) {
      console.log("email jau eksiste");
      emailID = u;
      oldStartDate = new Date(userArray[u].startDateTime);
      // console.log(oldStartDate, currentTime);
      // console.log("minutes",getTimeDifferenceInMinutes(oldStartDate, currentTime));
      if(getTimeDifferenceInMinutes(oldStartDate, currentTime) < 5){
        canPlay = false;
      }
		}
	}
  if(canPlay){
    setItems()
      .then(({items}) => {
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
  var userEmail = ''
  if(req.cookies.email){
    userEmail = req.cookies.email;
  }
    res.render('index', { 
      title: 'Skape vai Laime', 
      message: 'Šis ir teksts, kuru parāda kā mainīgo', 
      email: userEmail,
      // columnCount: columnCount, 
      // rowCount: rowCount 
  })
      
});
   
    


app.listen(3000, () => {
	console.log('Serveris sācis darboties, darbojos uz 3000 porta');
});