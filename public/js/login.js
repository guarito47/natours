
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
    //till here we received the response from the server so we cant show a proper message about the result
    //and if its success we need to refresh the page and redirect in order se the changes in the views (_header)
    if(res.data.status==='success'){
      //instead to a simple alert 
      //alert('Logged in Successfully!');
      //lets update with oir custom css alert through our showAlert function
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
