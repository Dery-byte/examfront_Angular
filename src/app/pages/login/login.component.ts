import { Component, OnInit ,TemplateRef, Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router,ActivatedRoute  } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';


import { Question } from 'src/model testing/model';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent implements OnInit {


  //  ============================SUBJECTIVE QUESTIONS=======================================

  //  ============================SUBJECTIVE QUESTIONS=======================================




















  quizForm: FormGroup;


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
  
  constructor( private fb: FormBuilder,
    private snack:MatSnackBar, 
    private route:ActivatedRoute, 
    private login:LoginService, 
    private router:Router, 
    private _formBuilder: FormBuilder, 
    public dialog: MatDialog){}
  
  dialogRef!: MatDialogRef<any>;


  //  ============================OPEN DIALOGY FANCY=======================================
  openUpdateDialog(templateRef: TemplateRef<any>): void {
    // Fetch question details based on ID
    this.dialogRef = this.dialog.open(templateRef, {
      width: '350px',
    });

      this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
      }
  
    });
   
  }
  //  ============================SUBJECTIVE QUESTIONS=======================================

 
//  ============================SUBJECTIVE QUESTIONS=======================================


    ngOnInit(): void{

//  ============================SUBJECTIVE QUESTIONS=======================================
  
//  ============================SUBJECTIVE QUESTIONS=======================================


      this.route.queryParams.subscribe(params => {
        const token = params['token'];
        if (token) {
          console.log('Received token:', token);
          // Here you should store the token securely and handle the authentication
          // For this example, we're just navigating to the dashboard
          this.router.navigate(['/dashboard']);
        }
      });

      this.allusers();
      this.preventLoginForm();
    }








//  ============================SUBJECTIVE QUESTIONS=======================================

   
//  ============================SUBJECTIVE QUESTIONS=======================================












    preventLoginForm(){
      
if(this.login.getUserRole()=="ADMIN"){
  //Admin Dasboard
  window.location.href="/admin"; 
  // this.router.navigate(["admin"])
  this.login.loginStatusSubject.next(true);
  }
  else if(this.login.getUserRole()=="NORMAL"){
    // NORMAL User-dashboard
    window.location.href="/user-dashboard";

    // window.location.href="/register-courses/";
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
          Swal.fire("Success ", "Quiz Updated Successfully","success")
        
        },
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
  

// signInWithGoogle() {
//   // console.log('Navigating to Google OAuth');
//   this.router.navigate(['/oauth2/authorization/google']).then(success => {
//     if (success) {
//       console.log('Navigation successful');
//     } else {
//       console.log('Navigation failed');
//     }
//   });
// }

// signInWithGoogle() {
//   const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/authorization'; // Replace with your actual Google OAuth URL
//   window.location.href = googleOAuthUrl;
// }

 generateState(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < 16; i++) {
    state += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return state;
}

// const stateValue = generateState();

signInWithGoogle() {
  // const clientId = '1006167054424-vgf13e2d85q918umpdku10un40613m1v.apps.googleusercontent.com'; // Replace with your actual Google client ID
  // const responseType = 'code'; // Use 'code' if you are using server-side authorization
  // const scope = 'email profile'; // Define the scopes you need
  // // const state = this.generateState(); // Optional: State parameter to protect against cross-site request forgery
  // const redirectUri='/login'

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/authorization`;
  window.location.href = googleOAuthUrl;
}



}
