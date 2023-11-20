import { Component, OnInit , Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent implements OnInit {

  productDialog: boolean;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isEditable = false;  

  loginData={
    username:'',
    password:'',
  }




  passwordResetData={
    username:'',
    email:'',
    newpassword:'',
    confirmPassword:''

  }
  
  constructor(private snack:MatSnackBar, private login:LoginService, private router:Router, private _formBuilder: FormBuilder, public dialog: MatDialog){}
 

  // Openpopup(){
  //   this.dialog.open(ResetpopupComponent,{
  //     width:'40%',
  //     // height:'450px'
  //   })
  // }
    ngOnInit(): void{}
    
    hideDialog() {
      this.productDialog = false;
      // this.submitted = false;
  }
  openNew() {
      // this.product = {};
      // this.submitted = false;
      this.productDialog = true;
  }

    deleteSelectedProducts(){}

  formSubmit(){
    console.log("login btn clicked");

    if(this.loginData.username.trim()==' ' || this.loginData.password ==null){
  this.snack.open('Username is required !! ', '',{
  duration:3000,});
  return;
    }

    if(this.loginData.username.trim()== ' ' || this.loginData.password ==null){
      this.snack.open('Password is required !! ', '',{
      duration:3000,});
      return;
        }

        // Requesting server to generate token
this.login.generateToken(this.loginData).subscribe(
  (data:any)=>{
    console.log("Success");
    console.log(data);

    //Login...
 this.login.loginUser(data.token);
 this.login.getCurrentUser().subscribe(
  (user:any)=>{
    this.login.setUser(user);
    console.log(user);
//redirect ...ADMIN: admin-dashboard

//rdirect ...NORMAL: normal-dashboard
if(this.login.getUserRole()=="ADMIN"){
//Admin Dasboard
window.location.href="/admin"; 
// this.router.navigate(["admin"])
// this.login.loginStatusSubject.next(true);

}
else if(this.login.getUserRole()=="NORMAL"){
  // NORMAL User-dashboard
  window.location.href="/user-dashboard/0";
  // this.router.navigate(["user-dashboard"]);
  // this.login.loginStatusSubject.next(true);


}
else{
  this.login.logout();
}


  }
 );


  },
  (error)=>{
    console.log("Error !!!!");
    console.log(error);
    this.snack.open("Invalid Details  !! Try again", "", {
      duration:3000,
    })
  });

  }



  passwordChange(){
    console.log("Reset btn clicked");
    this.login.resetPassword(this.passwordResetData).subscribe((data:any)=>{
      console.log('Reset was successful');
      console.log(data);
    })

  }
saveProduct() {
    
    
}
  

}
