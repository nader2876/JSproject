function checkName(element,fnameid){
let x=element.value;
const pattern= /^[A-Za-z\u0600-\u06FF]+(?:\s[A-Za-z\u0600-\u06FF]+)*$/;
const test= pattern.test(x);
if(!test){
document.getElementById(fnameid).innerHTML=" please use letters only";



}
else{document.getElementById(fnameid).innerHTML="";
}


}
function checkBirthdate() {
    const birthdateInput = document.getElementById("birthdate").value;
   
    const errorElem = document.getElementById("date-error");

    if (!birthdateInput) {
        errorElem.innerText = "Please enter your birthdate";
      
        return false;
    }
    let Today= new Date();
    const birthDate= new Date(birthdateInput);
    console.log(Today);
       console.log(birthDate);
    
          if(Today.getFullYear()-birthDate.getFullYear()<13){
          errorElem.innerText="You must be at least 13 years old";
        return false}
    
else{errorElem.innerText="";
    return true;
}

          }
          function checkEmail(){

let email= document.getElementById("email").value;
errorElem= document.getElementById("email-error")
let pattern=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
if(!pattern.test(email))
{
 errorElem.innerText="please enter your email correctly."

}
else {errorElem.innerText="";}



          }
          function emailConf(){

let email= document.getElementById("email").value;
let confEmail= document.getElementById("confirm-email").value;
if(email==confEmail)
{document.getElementById("emailconf-error").innerText="";

          }
          else{
            document.getElementById("emailconf-error").innerText="the email and the confirmation email are not the same";
          }}

          function checkPassword(){
let password= document.getElementById("password").value;
let confirmPassword=document.getElementById("confirm-password").value;
let passwordError = document.getElementById("pass-error");
let confirmPassError= document.getElementById("confirm-password-error")
const passwordPattern = /^(?=(?:.*\d){2,})(?=.*[!@#$%^&*(),.?":{}|<>])[A-Z].{7,31}$/;


password.split('');

if(!passwordPattern.test(password)){
 passwordError.innerText="Password must start with a capital letter, contain at least two numbers, at least one special character, be between 8 and 32 characters long, and match the confirmation field.";

}
else{
    passwordError.innerText="";
}
if(password==confirmPassError)
{
    confirmPassError.innerText="";

}
else{confirmPassError.innerText="Password and confirmation password do not match "}


}
function confirmPassword(){
    let password= document.getElementById("password").value;
let confPassword=document.getElementById("confirm-password").value;

let confirmPassError= document.getElementById("confirm-pass-error");

if(password==confPassword)
{
    confirmPassError.innerText="";

}
else{confirmPassError.innerText="Password and confirmation password do not match "}


}
function checkPhone(){

let phone=document.getElementById("phone").value;
let phoneError= document.getElementById("phone-error");
phone.split('');

if(phone.length==10)
{

phoneError.innerText="";


}
else{
    phoneError.innerText="phone digits must be 10";

}
}

