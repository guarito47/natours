//this file is more to get data from the interface, an then delegate the actions
//because we are in client side we use only javascript languaje, instead of require we use import
//the babel polifyll makes the works the latest javascript features in all the browsers no need a variable
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login'
import {updateData, updateSettings} from './updateSettings';


//DOM ELEMENTS we will look at the page if they are requesting for the special elements to load by ex the map
//so if theres no need to load a map where a page doesnt have it, wil throw an error if we dont verify first
const mapBox=document.getElementById('map');//only available for the tour page
//we look as form to recognize as unique among other elements called login, 
//because the form--login is only available in login page
const loginForm=document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');



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

if(logoutBtn){  
  logoutBtn.addEventListener('click', logout);
}

if(userDataForm){
  userDataForm.addEventListener('submit', e=>{
    e.preventDefault();//this prevents to loading any other page  
    const name= document.getElementById('name').value;
    const email= document.getElementById('email').value;
    //we call the function that will update the data
    //updateData(name, email);
    //newer update using a generic data or password update
    updateSettings({name, email}, 'data');
  });  
}

if(userPasswordForm){
  userPasswordForm.addEventListener('submit',async e=>{
    e.preventDefault();//this prevents to loading any other page  
    //we change the button text to indicate that is updating, like a spinner loading effect
    document.querySelector('.btn--save-password').textContent='Updating...';
    const passwordCurrent= document.getElementById('password-current').value;
    const password= document.getElementById('password').value;
    const passwordConfirm= document.getElementById('password-confirm').value;
    await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');
    //because updateSettings is an async function we can as well "await" from here
    //in order to wait the result, and clear the password form, to dont keep the sensitive data in the form
    //so we will add async in the e=>{ to have this feature of await
    
    document.getElementById('password-current').value='';
    document.getElementById('password').value='';
    document.getElementById('password-confirm').value='';
    document.querySelector('.btn--save-password').textContent='Save password';    
  });  
}
