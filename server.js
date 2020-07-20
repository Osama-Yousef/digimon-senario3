'use strict';
// requierment

require('dotenv').config();

// application dependencies ( getting the libraries)

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverRide = require('method-override') // for lab 13(update and delete)

//main variables( application setup)


const PORT = process.env.PORT || 3030;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

// uses 

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverRide('_method')) 
app.use(cors());

//listen to port

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`)
    })
  }) 


////////////////////////////////////////////////

// for check that server is working 
/*
app.get('/',homeHandler)

function homeHandler(req,res){
    res.status(200).send('it works ');
}

*/
//////////////////////////////////////

//***********(Routs Definitions )**********\\
app.get('/',homeHandler)
app.get('/search',searchHandler);

app.post('/addToDb', addToDbHandler)
app.get('/selectData', selectDataHandler)
app.get('/details/:digi_id', detailsHandler)
app.put('/update/:update_id', updateHandler) 
                            

app.delete('/delete/:delete_id' , deleteHandler)
app.get('*', notFoundHandler)

//***********(Routs Handlers)**********\\



// app.get('/',homePage);
// app.get('/search',searchHandler);
// app.post('/list',myListHandler);
// app.get('/retrievedFromDB' , retrievedFromDB);
// app.get('/details/:movieId' , detailsHandler);
// app.put('/updatMovie/:movieId' , updateHandler)
// app.delete('/deleteMovie/:movieId' , deleteHandler);










//***********(homePageHandler)**********\\




function homeHandler(req, res) {
  
  res.render('index');
      }                     


    function searchHandler(req,res){

      let digimonsName = req.query.digimonsName;
      let radioVal = req.query.name;
      let url = `https://digimon-api.herokuapp.com/api/digimon/`
      if(radioVal == 'name'){
          url = `${url}name/${digimonsName}`;
      }else  if(radioVal == 'level'){
          url = `${url}level/${digimonsName}`;
      }else {
        url = `https://digimon-api.herokuapp.com/api/digimon/`
   }
  
      //pass it to the url 
      // let url = `https://digimon-api.herokuapp.com/api/digimon/name/${digimonsName}`;
      superagent.get(url)
          .then(data => {
              let digiArray = data.body.map(val => {
                  return new Digimons(val)
              })
              res.render('./pages/result', { data: digiArray });
          }).catch((err) => {
            errorHandler(err, req, res);
          });
  
  }

// the constructor function

function Digimons(val) { 
  this.name = val.name || 'no name'; 
  this.image= val.img || 'no img'; 
  this.level = val.level || 'no level' ;
}


//*******************\\ 
// this function(route) just will do inserting to db
function addToDbHandler(req,res){

// collect the data (first step)
let { name, image, level} = req.body; 
// insert the data
let sql= `INSERT INTO digi_test (name , image ,level) VALUES ($1,$2,$3);`; 
let safeValues= [ name,image,level] ; 

client.query(sql,safeValues).then(()=>{ 

res.redirect('/selectData') 
})                    

}



///////////////////////////////
// this function to do the selecting all pokemons and rendering process on the favourite page from the db
function selectDataHandler(req,res){
let sql= `SELECT * FROM digi_test ;`;
client.query(sql).then(result=>{ 
res.render('pages/favorite' , {data: result.rows})  

})
 
}

//************************************\\ 
function detailsHandler(req,res){

// collect param value to determine the pokemon i want 
let param= req.params.digi_id; 

// select the pokemon (element) where id=param (selecting just one thing not lke before for all thngs )
let sql= `SELECT * FROM digi_test WHERE id=$1 ;` ;
let safeValue=[param]; 
client.query(sql,safeValue).then(result=>{ 
res.render('pages/details' , {data: result.rows[0]}) 
})
}


//**************************************************************************\\ 


function updateHandler(req,res){
//collect the param value (coz we deal with param so this is first step)
let param=req.params.update_id;
// collect the updated data 
let { name, image, level} = req.body; // req.body here because in PUT/DELETE/POST we use this
// update where the id=param value
let sql=`UPDATE digi_test SET name=$1, image=$2, level=$3 WHERE id =$4 ;`;
let safeValues=[name,image,level,param]; // importantttt :: we must add param into array , else we will have errors
client.query(sql,safeValues).then(()=>{ // just will redirect me so there is no result here because UPDATE / INSERT / DELETE command doesnt return anythinggg

  res.redirect(`/details/${param}`)     // we want to redirect to the same page which is (details page) , and its route is /details/id for the element , so we wrote /details/${param} because id=param  and param points to the id for this element

})

}


 
//*************************************************************************************\\ 


function deleteHandler(req,res){

// must do : collect the  param value 
let param=req.params.delete_id;
// delete where id=param value (no need to collect data like the update)
let sql=`DELETE FROM digi_test WHERE id = $1 ;`;
let safeValue=[param];
client.query(sql,safeValue).then(()=>{ 

  res.redirect('/selectData') 

}
)

}
 


  //========================================\\
//error handlers


function errorHandler(err, req, res) {
    res.status(500).send(err);
  }
  
  //========================================\\
  
  
  function notFoundHandler(req, res) {
    res.status(404).send('This route does not exist!!'); // or the message ( page not found)
  }
  