
/**as this file is javascript and not node js we call export(javascript) and not exports (nodejs) */
import axios from 'axios';
import {showAlert} from './alerts'

export const login=async (email, password)=>{
  try{
    const res= await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data:{
        email,
        password
      }  
    });
    //till here we received the response from the server so we can show a proper message about the result
    //and if its success we need to refresh the page and redirect in order se the changes in the views (_header)
    if(res.data.status==='success'){
      //instead to a simple alert 
      //alert('Logged in Successfully!');
      //lets update with our custom css alert through our showAlert function
      showAlert('success', 'Logged in Successfully!');
      window.setTimeout(()=>{
        location.assign('/');//here we redirect after login to overview page, after 1.5 sec
      }, 1500);
    }
  
  } catch (err){
    //alert(err.response.data.message);//we show the fail response to login extracting from this path
    showAlert('error', err.response.data.message);
  }
};

export const logout= async ()=>{
  try{
    const res= await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });

    //once is executed the logout at this point we have a invalid cookie in the browser, so we need to reload the page
    //if we dont do that step the page still show as logged till click in another page, so to reflect the change 
    //we will reload the page as follows
    console.log("res.data");
    console.log(res.data);
    if(res.data.status==='success'){
      //this reload will force reload from the server and not from the browser cache
      //if we dont set true, it will reload from the browser, it will have the dummy token that is correct but
      //will keep the header as logger user because the server dont send the new _header view as loggout
      location.reload(true)
    }
  } catch(err){
    console.log(err);
    showAlert('error', 'Error logout, try again!');
  }
  
};
