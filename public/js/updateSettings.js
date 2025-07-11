import axios from 'axios'; //this is es6 syntax(client side) and not the common js syntax that we use in nodejs
import { showAlert } from './alerts.js';

//now creating the way using teh API endpoint and to dont leave the page when an error occours, instead we will 
//show a popup alert with the proper message
//updateData only works for update username and email, below this we have updateSetting that cover all in 1
export const updateData= async(name, email)=>{

  try {
    const res = await axios({
      method: 'PATCH',
      //for now we are using our localhost but later we will use the production url
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        name,
        email
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
      /*window.setTimeout(() => {
        location.reload(true); //reload the page to see the changes
      }, 1500);*/
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

//updateSettings is an upgrade of updateData to general update all the user settings
//like handlerFactory, data is an object with all the info to update, and type the api method to use
export const updateSettings= async(data, type)=>{
  try {

    const url=
      type==='password'//here we switch the api method
      ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',      
      url,
      data,//the data we receive is a object like {name, email} or {passwordCurrent, password, passwordConfirm}

    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!!`);
      
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};