import { Component, OnInit, } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router';
import swal from 'sweetalert2'
import { ScreenshotPreventionService } from 'src/app/services/ScreenshotPreventionService ';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {


  constructor(private userService: UserService, private snack: MatSnackBar,private router: Router,
    private screenshotPrevention: ScreenshotPreventionService,
  ) { }
  isLogingIn = false;
  public user = {
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',

  };
  ngOnInit(): void {
        // this.screenshotPrevention.enableProtection();
   }

// Add these to your component class
hidePassword = true;
hideConfirmPassword = true;


  // usernamePattern: RegExp = /^[a-zA-Z]{2}\/[a-zA-Z]{3}\/\d{2}\/\d{4}$/i;

  usernamePattern: RegExp = /^[A-Z]{2,5}\/[A-Z]{2,4}\/\d{2}(\/\d{2})?\/\d{4}$/i;

  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validateUsername(username: string): boolean {
    return this.usernamePattern.test(username);
  }


  validateEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }


  loading = false;
  formSubmit() {

    this.loading = true;
    console.log(this.user);
    this.user.username = this.user.username.toUpperCase();

    if (this.user.username == '' || this.user.username == null) {
      // this.loading = false;
      // alert("User is required");
      this.snack.open(' Username is required !!', "", {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      this.loading = false;


    } else if (this.user.password == '' || this.user.password == null) {
      this.loading = false;

      this.snack.open(' Please provide a password!!', "", {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      // this.isLogingIn=false;
      return;
    }

    // REGEX FOR THE USERNAME/ STUDENT ID
    const isUsernameValid = this.validateUsername(this.user.username);
    const isEmailValid = this.validateEmail(this.user.email);

    if (!isUsernameValid) {
      this.snack.open('Username is invalid!', "", {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      // this.isLogingIn = false;
      this.loading = false;

      return;
    }

    if (!isEmailValid) {
      this.snack.open('Email is invalid!', "", {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      this.loading = false;
      // this.isLogingIn = false;
      return;
    }

    //addUser: userservice
    this.userService.addUser(this.user).subscribe((data: any) => {
      //success
      this.isLogingIn = true;
      console.log(data);
      // alert("Success");
      // swal.fire('Succesful', 'Registration Successful', 'success');
      // window.location.href = "/login";
      setTimeout(() => {
  console.log(data);
  
  swal.fire({
    title: 'Successful',
    text: 'Registration Successful',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false
  }).then(() => {
    this.isLogingIn = false; // Clean up loading state
    this.router.navigate(['/login']); // Better than window.location
  });
}, 1400);

    },
      (error) => {
        //Error mesage here
        console.log(error);
        // alert("Error");
        this.isLogingIn = false;

        this.snack.open('Email or Username is in the System ! ! ', '', {
          duration: 1000,
        });
                this.loading = false;

      }

    );
  }





}
