// import { Component, OnInit, TemplateRef, Inject } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router, ActivatedRoute } from '@angular/router';
// import Swal from 'sweetalert2';
// import { LoginService } from 'src/app/services/login.service';
// import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { NgForm } from '@angular/forms';  // <--- add this


// import { Question } from 'src/model testing/model';
// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })



// export class LoginComponent implements OnInit {


//   //  ============================SUBJECTIVE QUESTIONS=======================================

//   //  ============================SUBJECTIVE QUESTIONS=======================================





//   hidePassword = true;
//   hideNewPassword = true;
//   hideConfirmPassword = true;














//   quizForm: FormGroup;


//   productDialog: boolean;

//   isLogingIn = false;

//   firstFormGroup = this._formBuilder.group({
//     firstCtrl: ['', Validators.required],
//   });
//   secondFormGroup = this._formBuilder.group({
//     secondCtrl: ['', Validators.required],
//   });
//   isEditable = false;

//   loginData = {
//     username: '',
//     password: '',
//   }

//   resetData = {
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   }

//   allUsers = [];

//   constructor(private fb: FormBuilder,
//     private snack: MatSnackBar,
//     private route: ActivatedRoute,
//     private login: LoginService,
//     private router: Router,
//     private _formBuilder: FormBuilder,
//     public dialog: MatDialog) { }

//   dialogRef!: MatDialogRef<any>;




//   //  ============================OPEN DIALOGY FANCY=======================================
//   openUpdateDialog(templateRef: TemplateRef<any>): void {
//     // Fetch question details based on ID
//     this.dialogRef = this.dialog.open(templateRef, {
//       disableClose: true,  // ⬅️ prevents closing on backdrop click or ESC
//       width: '350px',
//         panelClass: 'custom-dialog-container'

//     });

//     this.dialogRef.afterClosed().subscribe(result => {
//       if (result) {

//       }

//     });

//   }

//   ngOnInit(): void {

//     this.route.queryParams.subscribe(params => {
//       const token = params['token'];
//       if (token) {
//         console.log('Received token:', token);
//         // Here you should store the token securely and handle the authentication
//         // For this example, we're just navigating to the dashboard
//         this.router.navigate(['/dashboard']);
//       }
//     });

//     this.allusers();
//     this.preventLoginForm();
//   }






//   preventLoginForm() {
//     const role = this.login.getUserRole();

// if (role === 'ADMIN') {
//   window.location.href = '/admin';
// }
// else if (role === 'NORMAL') {
//   window.location.href = '/user-dashboard';
// }
// else if (role === 'LECTURER') {
//   window.location.href = '/lect';
// }
// else {
//   console.error('Unknown role:', role);
//   this.login.logout();
// }

// this.login.loginStatusSubject.next(true);


//     // if (this.login.getUserRole() == "ADMIN") {
//     //   //Admin Dasboard
//     //   window.location.href = "/admin";
//     //   // this.router.navigate(["admin"])
//     //   this.login.loginStatusSubject.next(true);
//     // }
//     // else if (this.login.getUserRole() == "NORMAL") {
//     //   // NORMAL User-dashboard
//     //   window.location.href = "/user-dashboard";

//     //   // window.location.href="/register-courses/";
//     //   // this.router.navigate(["user-dashboard"]);
//     //   this.login.loginStatusSubject.next(true);
//     // }
//     // else {
//     //   this.login.logout();
//     // }



//   }
//   allusers() {
//     this.login.getAllUsers().subscribe((users: any) => {
//       this.allUsers = users;
//       // this.allUsers.forEach((u)=>{
//       //   this.allUsers=u.username
//       //   console.log(this.allUsers);
//       // });
//       //console.log(this.allUsers[0].username);
//       console.log(this.allUsers)



//     });
//   }

//   hideDialog() {
//     this.productDialog = false;
//   }
//   openNew() {
//     this.productDialog = true;
//   }

//   deleteSelectedProducts() { }

//   loading = false;





//   formSubmit() {
//     this.isLogingIn = true;
//     this.loading = true;
//     this.hideDialog();
//     if (this.loginData.username.trim() == ' ' || this.loginData.password == null) {
//       this.loading = false;
//       this.snack.open('Username is required !! ', '', {
//         duration: 3000,
//       });
//       return;
//     }

//     if (this.loginData.username.trim() == ' ' || this.loginData.password == null) {
//       this.isLogingIn = true;

//       this.snack.open('Password is required !! ', '', {
//         duration: 3000,
//       });
//       return;
//     }
//     // Requesting server to generate token
//     this.isLogingIn = false;
//     this.login.generateToken(this.loginData).subscribe(

//       (data: any) => {
//         this.isLogingIn = true;

//         console.log("Success");
//         console.log(data);

//         //Login...
//         this.login.loginUser(data.token);
//         this.login.getCurrentUser().subscribe(
//           (user: any) => {
//             this.login.setUser(user);
//             console.log(user);
//             //redirect ...ADMIN: admin-dashboard

//             //rdirect ...NORMAL: normal-dashboard
//             if (this.login.getUserRole() == "ADMIN") {
//               //Admin Dasboard
//               window.location.href = "/admin";
//               // this.router.navigate(["admin"])
//               // this.login.loginStatusSubject.next(true);

              
//             }
//               else if (this.login.getUserRole() == "LECTURER") {
//               // NORMAL User-dashboard
//               window.location.href = "/lect";
//               // this.router.navigate(["user-dashboard"]);
//               // this.login.loginStatusSubject.next(true);
//             }
//             else if (this.login.getUserRole() == "NORMAL") {
//               // NORMAL User-dashboard
//               window.location.href = "/user-dashboard/0";
//               // this.router.navigate(["user-dashboard"]);
//               // this.login.loginStatusSubject.next(true);
//             }
//             else {
//               this.login.logout();
//             }
//           }
//         );
//       },
//       (error) => {
//         this.loading = false;

//         console.log("Error !!!!");
//         console.log(error);
//         this.snack.open("Invalid Details  !! Try again", "", {
//           duration: 3000,
//         })
//       });

//   }


//   showSuccessMessage = false;
//   isSubmitting = false;
//   loginError = '';
//   passwordVisible = false;
//   apiError: string | null = null;
//   successEmail: string | null = null;  // store the email that was sent




//   onForgotPasswordSubmit(form?: NgForm) {
//     // Validate email: empty or invalid format
//     if (!this.resetData.email || !this.isValidEmail(this.resetData.email)) {
//       if (form) form.control.markAllAsTouched(); // show validation errors
//       return;
//     }

//     this.isSubmitting = true;
//     this.showSuccessMessage = false;
//     this.apiError = null;

//     const email = this.resetData.email;
//     console.log(email);

//     this.login.requestPasswordResetLink(email).subscribe({
//       next: () => {
//         this.successEmail = email;

//         if (form) {
//           form.resetForm();             // reset first
//         }
//         this.resetData.email = '';      // clear model

//         this.showSuccessMessage = true; // now hide the form
//       },
//       error: (err) => {
//         console.error('Password reset error:', err);
//         this.apiError = err.error?.message || 'Failed to send reset link. Please try again.';
//         this.isSubmitting = false;

//       },
//       complete: () => {
//         this.isSubmitting = false;
//       }
//     });
//   }

//   // Helper function to check valid email
//   isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   onCloseDialog() {
//     this.dialogRef.close();
//     // reset state so the form shows next time
//     this.showSuccessMessage = false;
//     this.apiError = null;
//     this.successEmail = null;
//     this.resetData.email = '';

//   }

//   resetPasswordForm() {
//     this.resetData.username = '',
//       this.resetData.email = '',
//       this.resetData.password = '',
//       this.resetData.confirmPassword = ''
//   }

//   saveProduct() {
//   }


//   generateState(): string {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let state = '';
//     for (let i = 0; i < 16; i++) {
//       state += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return state;
//   }

  
//   // const stateValue = generateState();
//   signInWithGoogle() {
//     // const clientId = '1006167054424-vgf13e2d85q918umpdku10un40613m1v.apps.googleusercontent.com'; // Replace with your actual Google client ID
//     // const responseType = 'code'; // Use 'code' if you are using server-side authorization
//     // const scope = 'email profile'; // Define the scopes you need
//     // // const state = this.generateState(); // Optional: State parameter to protect against cross-site request forgery
//     // const redirectUri='/login'
//     const googleOAuthUrl = `https://accounts.google.com/o/oauth2/authorization`;
//     window.location.href = googleOAuthUrl;
//   }



// }


























import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hidePassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  
  isLogingIn = false;
  loading = false;
  productDialog: boolean = false;
  
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  isEditable = false;

  loginData = {
    username: '',
    password: '',
  };

  resetData = {
    email: ''
  };

  allUsers: any[] = [];
  dialogRef!: MatDialogRef<any>;
  
  // Forgot password states
  showSuccessMessage = false;
  isSubmitting = false;
  apiError: string | null = null;
  successEmail: string | null = null;

  constructor(
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private login: LoginService,
    private router: Router,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check for OAuth token in query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('Received OAuth token:', token);
        this.router.navigate(['/dashboard']);
      }
    });

    // Redirect if already logged in
    this.redirectIfLoggedIn();
    
    // Load all users (if needed for admin)
    this.allusers();
  }

  /**
   * Redirect user if already logged in
   */
  redirectIfLoggedIn(): void {
    if (!this.login.isLoggedIn()) {
      return; // Not logged in, stay on login page
    }

    const role = this.login.getUserRole();
    
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'LECTURER':
        this.router.navigate(['/lect']);
        break;
      case 'NORMAL':
        this.router.navigate(['/user-dashboard/0']);
        break;
      default:
        console.error('Unknown role:', role);
        this.login.logout();
    }
  }

  /**
   * Fetch all users
   */
  allusers(): void {
    this.login.getAllUsers().subscribe({
      next: (users: any) => {
        this.allUsers = users;
        console.log('All users:', this.allUsers);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  /**
   * Handle login form submission
   */
  formSubmit(): void {
    // Validate inputs
    if (!this.loginData.username?.trim()) {
      this.snack.open('Username is required!', '', { duration: 3000 });
      return;
    }

    if (!this.loginData.password?.trim()) {
      this.snack.open('Password is required!', '', { duration: 3000 });
      return;
    }

    this.isLogingIn = true;
    this.loading = true;

    // Step 1: Authenticate and get cookie from backend
    this.login.generateToken(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Authentication successful, cookie set');
        
        // Step 2: Fetch current user details
        this.login.getCurrentUser().subscribe({
          next: (user: any) => {
            console.log('User details:', user);
            
            // Step 3: Store user in localStorage
            this.login.loginUser(user);
            
            // Step 4: Redirect based on role
            const role = this.login.getUserRole();
            this.redirectToRoleDashboard(role);
          },
          error: (error) => {
            console.error('Error fetching user:', error);
            this.loading = false;
            this.isLogingIn = false;
            this.snack.open('Failed to fetch user details', '', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.isLogingIn = false;
        
        const errorMessage = error.status === 401 
          ? 'Invalid username or password' 
          : 'Login failed. Please try again';
          
        this.snack.open(errorMessage, '', { duration: 3000 });
      }
    });
  }

  /**
   * Redirect user to appropriate dashboard based on role
   */
  private redirectToRoleDashboard(role: string | null): void {
    switch(role) {
      case 'ADMIN':
        window.location.href = '/admin';
        break;
      case 'LECTURER':
        window.location.href = '/lect';
        break;
      case 'NORMAL':
        window.location.href = '/user-dashboard/0';
        break;
      default:
        console.error('Unknown role:', role);
        this.login.logout();
    }
  }

  /**
   * Handle forgot password submission
   */
  onForgotPasswordSubmit(form?: NgForm): void {
    // Validate email
    if (!this.resetData.email || !this.isValidEmail(this.resetData.email)) {
      if (form) form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.apiError = null;

    const email = this.resetData.email;
    console.log('Requesting password reset for:', email);

    this.login.requestPasswordResetLink(email).subscribe({
      next: () => {
        this.successEmail = email;
        if (form) {
          form.resetForm();
        }
        this.resetData.email = '';
        this.showSuccessMessage = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Password reset error:', err);
        this.apiError = err.error?.message || 'Failed to send reset link. Please try again.';
        this.isSubmitting = false;
      }
    });
  }









  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Open dialog
   */
  openUpdateDialog(templateRef: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(templateRef, {
      disableClose: true,
      width: '350px',
      panelClass: 'custom-dialog-container'
    });
  }

  /**
   * Close dialog and reset state
   */
  onCloseDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.showSuccessMessage = false;
    this.apiError = null;
    this.successEmail = null;
    this.resetData.email = '';
  }

  /**
   * Dialog utilities
   */
  hideDialog(): void {
    this.productDialog = false;
  }

  openNew(): void {
    this.productDialog = true;
  }

  /**
   * Google OAuth sign-in
   */
  signInWithGoogle(): void {
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/authorization`;
    window.location.href = googleOAuthUrl;
  }

  /**
   * Generate random state for OAuth
   */
  generateState(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 16; i++) {
      state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
  }
}