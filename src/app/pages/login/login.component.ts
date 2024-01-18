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

  isLogingIn=false;

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

  resetData={
    username:'',
    email:'',
    password:'',
    confirmPassword:''
  }

  allUsers=[];
  
  constructor(private snack:MatSnackBar, private login:LoginService, private router:Router, private _formBuilder: FormBuilder, public dialog: MatDialog){}
 
    ngOnInit(): void{
      this.allusers();
      this.preventLoginForm();
    }
    

    preventLoginForm(){
      
if(this.login.getUserRole()=="ADMIN"){
  //Admin Dasboard
  window.location.href="/admin"; 
  // this.router.navigate(["admin"])
  this.login.loginStatusSubject.next(true);
  }
  else if(this.login.getUserRole()=="NORMAL"){
    // NORMAL User-dashboard
    window.location.href="/user-dashboard/0";
    // this.router.navigate(["user-dashboard"]);
    this.login.loginStatusSubject.next(true);
  }
  else{
    this.login.logout();
  }



    }
    allusers(){
      this.login.getAllUsers().subscribe((users:any)=>{
        this.allUsers=users;
        // this.allUsers.forEach((u)=>{
        //   this.allUsers=u.username
        //   console.log(this.allUsers);
        // });
//console.log(this.allUsers[0].username);
console.log(this.allUsers)



      });
    }

    hideDialog() {
      this.productDialog = false;
  }
  openNew() {
      this.productDialog = true;
  }

    deleteSelectedProducts(){}

  formSubmit(){
    // this.isLogingIn=true;
this.hideDialog();
    if(this.loginData.username.trim()==' ' || this.loginData.password ==null){
  this.snack.open('Username is required !! ', '',{
  duration:3000,});
  return;
    }
    this.isLogingIn=false;

    if(this.loginData.username.trim()== ' ' || this.loginData.password ==null){
      this.isLogingIn=true;

      this.snack.open('Password is required !! ', '',{
      duration:3000,});
      return;
        }
        // Requesting server to generate token
        this.isLogingIn=false;
this.login.generateToken(this.loginData).subscribe(
  
  (data:any)=>{
    this.isLogingIn=true;





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
    console.log(this.allUsers);
    this.hideDialog();
     this.allUsers.forEach((u)=>{
      console.log(u.username)
      console.log(this.resetData.username)
      if(u.username == this.resetData.username){

         this.login.resetPassword(this.resetData).subscribe((resetdata:any)=>
         {
          Swal.fire("Success ", "Quiz Updated Successfully","success").then((e)=>
          {
            // this.router.navigate(["/"]);
            // window.location.href="/"; 

          }); },
    (error)=>{
      this.resetPasswordForm();
      Swal.fire({
        title:"Success",
        text:"Password reset was successful",
        icon:"success",
        timer:10000, 
        showConfirmButton:true
      }).then(()=>{
        // window.location.href="/login"; 
      });
   
    });

    
      }else{
        this.resetPasswordForm();
      Swal.fire("Error", "Password reset unsuccessful", "error");
        console.log("Username not in the database");
      }
    });
      // console.log("Not in the list")
    }

    resetPasswordForm(){
      this.resetData.username='',
      this.resetData.email='',
      this.resetData.password='',
      this.resetData.confirmPassword=''
    }
  
saveProduct() {
    
    
}
  

}
