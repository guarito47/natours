//this file is more to get data fropm the interface, an then delegate the actions
//because we are in client side we use only javascript languaje, instead of require we use import
//the babel polifyll makes the works the latest javascript features in all the browsers no need a variable
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login} from './login'

//DOM ELEMENTS we will look at the page if they are requesting for the special elements to load by ex the map
//so if theres no need to load a map where a page doesnt have it, wil throw an error if we dont verify first
const mapBox=document.getElementById('map');//for the tour page
const loginForm=document.querySelector('.form');
//VALUES
//we store globally all the data that we will need along the use for all the functions


//DELEGATION
if(mapBox){
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);

}

//we add the listening function of type'submit' and their event 'e' that will fire the request
if(loginForm){
  loginForm.addEventListener('submit', e=>{
    e.preventDefault();//this prevents to loading any other page  
    const email= document.getElementById('email').value;
    const password= document.getElementById('password').value;
    login(email, password);
  });  
}
