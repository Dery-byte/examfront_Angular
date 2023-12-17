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

  public user={

    username:'',
    password:'',
    firstname:'',
    lastname:'',
    email:'',
    phone:'',

  };
  ngOnInit():void{} 

  formSubmit(){ 
    console.log(this.user);

    if(this.user.username=='' || this.user.username==null){

      // alert("User is required");
      this.snack.open(' Username is required !!', "", {
        duration:3000,
        verticalPosition:'top',
        horizontalPosition:'right'
      });

      return;
    }

      //addUser: userservice
this.userService.addUser(this.user).subscribe( (data:any)=>{
  //success
  console.log(data);
  // alert("Success");
  swal.fire('Succesful', 'Registration Successful', 'success');

  window.location.href="/login"; 

},
(error)=>{
//Error mesage here
console.log(error);
// alert("Error");

this.snack.open('Something went wrong ! ! ','',{
  duration:1000,
});
}

);
  }




}
