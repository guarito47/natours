export const hideAlert = ()=>{
  const el= document.querySelector('.alert');//the <div class="alert class name to find the alert
  if(el)//if we found it the alert
    el.parentElement.removeChild(el) //we scale 1 element up and from the parent we said remove your child
};

export const showAlert=(type, msg)=>{
  hideAlert();//to prevent that any other alert its active before show this new one
  //types can be success, error we have a css class for both
  const markup=`<div class="alert alert--${type}">${msg}</div>`;
  //now lets position the markup
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  //now its showed up, but now we need to hided after 5 secs
  window.setTimeout(hideAlert, 5000);
};