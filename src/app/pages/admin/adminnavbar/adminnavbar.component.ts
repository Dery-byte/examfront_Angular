import { Component, NgZone, ViewChild, TemplateRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MailServiceService } from 'src/app/services/mail-service.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { trigger, style, animate, transition } from '@angular/animations';



interface TimeDisplay {
  display: string;
  className: string;
}

@Component({
  selector: 'app-adminnavbar',
  templateUrl: './adminnavbar.component.html',
  styleUrls: ['./adminnavbar.component.css'],
 animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AdminnavbarComponent {
  	@ViewChild('drawer') drawer!: MatDrawer;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  badgevisible = false;
  badgevisibility() {
    this.badgevisible = true;
  }

  isloggedIn = false;
  hasAuthority(authority: string): boolean {
    return this.user?.authorities?.some(auth => auth.authority === authority);
  }

  user = null;
  // timeLeftDisplay: TimeDisplay | string;
  timeLeftDisplay: TimeDisplay = { display: '', className: '' };

  private intervalId: any; // To store the interval reference
  isAdminUser = false;
  	isMobile = false;
 timeDisplay: TimeDisplay = { display: '00 min : 00 sec', className: 'normal-minutes' };
  private expirationSubscription?: Subscription;


  categories;

  mailInfo = {
    mailTo: "emmanuelderryshare@gmail.com",
    mailFrom: "",
    mailSubject: "",
    mailContent: "",
  }

  constructor(public login: LoginService,
    private _snack: MatSnackBar,
    private _cat: CategoryService,
    private router: Router,
    private tokenExpirationService: TokenExpirationService,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private mailservice: MailServiceService,
    private breakpointObserver: BreakpointObserver
  ) {
  }


  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }


	ngOnDestroy(): void {
		 if (this.expirationSubscription) {
      this.expirationSubscription.unsubscribe();
    }
		// Clear the interval when the component is destroyed to prevent memory leaks
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

  ngOnInit(): void {



    this.isloggedIn = this.login.isLoggedIn();
    this.user = this.login.getUser();
    this.isAdminUser = this.hasAuthority('ADMIN');   // ✅ compute once
    this.startCountdown();

    // react to login status changes
    this.login.loginStatusSubject.asObservable().subscribe(() => {
      this.isloggedIn = this.login.isLoggedIn();
      this.user = this.login.getUser();
      this.isAdminUser = this.hasAuthority('ADMIN');  // ✅ recompute
    });

    this._cat.getCategories().subscribe(
      (data: any) => {
        this.categories = data;
      },
      (error) => {
        this._snack.open("Couldn't load Categories from Server", "", { duration: 3000 });
      }
    );
       this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
          this.isMobile = result.matches;
    
          if (this.isMobile) {
            // On mobile: close drawer
            this.drawer?.close();
          } else {
            // On desktop: open drawer
            this.drawer?.open();
          }
        });
  }

  closeDrawerOnMobile() {
    if (this.isMobile) {
      this.drawer.close();
    }
  }

  dialogRef!: MatDialogRef<any>;



  public logout() {
    this.login.logout();
    this.isloggedIn = false;
    this.user = null;
    window.location.reload();
    // window.location.href = "/login";
  }


  
  startCountdown(): void {
    this.tokenExpirationService.startCountdownFromBackend();
    
    // Subscribe to the countdown updates
    this.expirationSubscription = this.tokenExpirationService.expiration$.subscribe(
      (seconds) => {
        if (seconds === 0) {
          // Token expired - auto logout
          this.handleTokenExpiration();
        } else {
          // Update the display
          const minutesLeft = Math.floor(seconds / 60);
          this.timeDisplay = this.formatTime(seconds, minutesLeft);

		  console.log("This is the time to display ", this.timeDisplay)
          
          // Trigger alert effect when less than 1 minute left
          if (minutesLeft === 0 && seconds <= 60) {
            this.triggerAlertEffect();
          }
        }
      }
    );
  }

  private handleTokenExpiration(): void {
    // this.timeDisplay = { display: 'Session Expired', className: 'expired' };
    
    // // Optional: Show a notification before auto-logout
    // alert('Your session has expired. You will be logged out.');
    
    // // Auto logout after a short delay
    // setTimeout(() => {
    //   this.logout();
    // }, 2000);
  }

  // Add a method to handle alert effect
  private triggerAlertEffect(): void {
    const alertClass = 'alert'; // Define the alert class
    const minutesElement = document.querySelector('.minutes-display'); // Adjust selector based on your HTML structure

    if (minutesElement) {
      minutesElement.classList.add(alertClass);
      setTimeout(() => {
        minutesElement.classList.remove(alertClass); // Remove alert class after 1 second
      }, 1000);
    }
  }

  private formatTime(timeInSeconds: number, minutesLeft: number): TimeDisplay {
    const hr = Math.floor(timeInSeconds / 3600);
    const mm = Math.floor((timeInSeconds % 3600) / 60);
    const ss = Math.floor(timeInSeconds % 60);

    // Format the time string
    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${this.formatNumber(hr)} hr(s) : `;
    }

    // Determine the CSS class based on minutesLeft
    const minutesClass = minutesLeft <= 5 ? 'warning-minutes' : 'normal-minutes';

    formattedTime += `${this.formatNumber(mm)} min : ${this.formatNumber(ss)} sec`;

    return { display: formattedTime, className: minutesClass };
  }

  private formatNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }










  openUpdateDialog(templateRef: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '500px',
      data: "",
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //   this.theory = result;
      }
    });
  }

  sendEmail() {

    this.mailservice.sendMail(this.mailInfo).subscribe((data) => {

      this._snack.open("Email Sent Successfully", "", {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar'],
      },)
      this.mailInfo = {
        mailTo: "emmanuelderryshare@gmail.com",
        mailFrom: "",
        mailSubject: "",
        mailContent: "",
      }
      this.dialogRef.close();
      //   this._snack.open("We will get back to you soon","",{
      // 	duration:3000
      //   })
    }),
      (error) => {
        this._snack.open("Email Not sent", "", {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar'],
        },)
        console.log(this.mailInfo);
      }
  }

}
