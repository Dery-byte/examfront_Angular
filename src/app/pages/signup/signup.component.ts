import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar'
import swal from 'sweetalert2'
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private userService: UserService, private snack:MatSnackBar){}
  isLogingIn=false;
  public user={
    username:'',
    password:'',
    firstname:'',
    lastname:'',
    email:'',
    phone:'',

  };
  ngOnInit():void{} 




   usernamePattern: RegExp = /^[a-zA-Z]{2}\/[a-zA-Z]{3}\/\d{2}\/\d{4}$/i;
   emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   validateUsername(username: string): boolean {
    return this.usernamePattern.test(username);
  }


   validateEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }



  formSubmit(){ 
    console.log(this.user);
    this.user.username = this.user.username.toUpperCase();

    if(this.user.username=='' || this.user.username==null){

      // alert("User is required");
      this.snack.open(' Username is required !!', "", {
        duration:3000,
        verticalPosition:'top',
        horizontalPosition:'right'
      });
      this.isLogingIn=false;

     
    }  else if (this.user.password == '' || this.user.password == null){
      this.snack.open(' Please provide a password!!', "", {
        duration:3000,
        verticalPosition:'top',
        horizontalPosition:'right'
      });
      this.isLogingIn=false;
      return;
    }

    // REGEX FOR THE USERNAME/ STUDENT ID
    const isUsernameValid = this.validateUsername(this.user.username);
    const isEmailValid = this.validateEmail(this.user.email);

    if(!isUsernameValid)
      {
        this.snack.open('Username is invalid!', "", {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'right'
        });
        this.isLogingIn = false;
        return;
    }

    if(!isEmailValid){
      this.snack.open('Email is invalid!', "", {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
    });
    this.isLogingIn = false;
    return;
    }

  //addUser: userservice
this.userService.addUser(this.user).subscribe( (data:any)=>{
  //success
  this.isLogingIn=true;
  console.log(data);
  // alert("Success");
  swal.fire('Succesful', 'Registration Successful', 'success');
  window.location.href="/login"; 

},
(error)=>{
//Error mesage here
console.log(error);
// alert("Error");
this.isLogingIn=false;

this.snack.open('Email or Username is in the System ! ! ','',{
  duration:1000,
});
}

);
  }

 



}
