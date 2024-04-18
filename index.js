const express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const fs = require('fs');
const app = express();


const columnCount = 3;
const rowCount = 3;
const items = new Array(rowCount*columnCount);

app.use('/public', express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, '/public/images')));
app.use('/images', express.static(path.join(__dirname, '/public/images/items')));


app.set('views', 'views');
app.set('view engine', 'ejs');






function setItems(){
  return new Promise((resolve, reject) => {
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
        if(Math.floor(Math.random() * 4) == 0){//Izdomā vai uzvarēs
          console.log("Uzvarēja!");
          var winner = true;
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
          var winner = false;
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
        resolve({items, winnerItemIdxs});
        // console.log(items);
    });
  });
  
}


app.get('/data', (req, res) => {
  // var items = [1,2,3];

  setItems()
    .then(({items, winnerItemIdxs}) => {
      const data = { columnCount: columnCount, rowCount:rowCount, items:items, winnerItemIdxs:winnerItemIdxs };
      res.json(data);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
 });
app.get('/', (req, res) => {

  
  const width = columnCount * 100
  const height = rowCount * 100
  const cssContent = `
        .grid-container {
            display: grid;
            grid-template-columns: repeat(${columnCount}, 1fr); 
            grid-gap: 0px;
            width: ${width}px; 
          }
          .grid-item {
            background-color: #ccc;
            height: 100px; 
          }
          .grid-item img{
            max-width: 100%;
            max-height: 100%; 
            display: block;
            margin: auto; 
          }
    `;
        res.render('index', { 
          cssContent: cssContent,
          title: 'Skape vai Laime', 
          message: 'Šis ir teksts, kuru parāda kā mainīgo', 
          // columnCount: columnCount, 
          // rowCount: rowCount 
      })
      
});
   
    


app.listen(3000, () => {
	console.log('Serveris sācis darboties, darbojos uz 3000 porta');
});