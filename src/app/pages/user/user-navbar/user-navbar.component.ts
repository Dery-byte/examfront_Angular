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
import { MatDrawer } from '@angular/material/sidenav';
import { MailServiceService } from 'src/app/services/mail-service.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


interface TimeDisplay {
	display: string;
	className: string;
}
@Component({
	selector: 'app-user-navbar',
	templateUrl: './user-navbar.component.html',
	styleUrls: ['./user-navbar.component.css']
})
export class UserNavbarComponent {
	@ViewChild('drawer') drawer!: MatDrawer;

	dialogRef!: MatDialogRef<any>;


	

	isloggedIn = false;
	hasAuthority(authority: string): boolean {
		return this.user?.authorities?.some(auth => auth.authority === authority);
	}
	user = null;
	// timeLeftDisplay: TimeDisplay | string;
	timeLeftDisplay: TimeDisplay = { display: '', className: '' };
	private intervalId: any; // To store the interval reference
	isNormalUser = false;   // ✅ precomputed flag
	isMobile = false;
	private subscription?: Subscription;

//   @ViewChild('drawer') drawer!: MatDrawer;




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
    this.startCountdown();
		this.isloggedIn = this.login.isLoggedIn();
		this.user = this.login.getUser();
		this.isNormalUser = this.checkAuthority('NORMAL');  // ✅ compute once
		this.startCountdown();
		// react to login status changes
		this.login.loginStatusSubject.asObservable().subscribe(() => {
			this.isloggedIn = this.login.isLoggedIn();
			this.user = this.login.getUser();
			this.isNormalUser = this.checkAuthority('NORMAL');  // ✅ recompute
		});


		// this.isloggedIn = this.login.isLoggedIn();
		// this.startCountdown();
		// this.user = this.login.getUser();
		// this.login.loginStatusSubject.asObservable().subscribe(data => {
		// 	this.isloggedIn = this.login.isLoggedIn();
		// });


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





	private checkAuthority(authority: string): boolean {
		return this.user?.authorities?.some((auth: any) => auth.authority === authority) ?? false;
	}

	//TRYING THE TIMER
	
	private hasLoggedOut = false;
 timeDisplay: TimeDisplay = { display: '00 min : 00 sec', className: 'normal-minutes' };
  private expirationSubscription?: Subscription;
  



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

  public logout(): void {
    this.login.logout();
    this.isloggedIn = false;
    this.user = null;
    window.location.reload();
  }

  private formatTime(timeInSeconds: number, minutesLeft: number): TimeDisplay {
    const hr = Math.floor(timeInSeconds / 3600);
    const mm = Math.floor((timeInSeconds % 3600) / 60);
    const ss = Math.floor(timeInSeconds % 60);
    
    // Format the time string
    let formattedTime = '';
    if (hr > 0) {
      formattedTime += `${this.formatNumber(hr)} hr : `;
    }
    formattedTime += `${this.formatNumber(mm)} min : ${this.formatNumber(ss)} sec`;
    
    // Determine the CSS class based on time left
    let minutesClass = 'normal-minutes';
    if (timeInSeconds <= 60) {
      minutesClass = 'critical-minutes'; // Less than 1 minute
    } else if (minutesLeft <= 5) {
      minutesClass = 'warning-minutes'; // Less than 5 minutes
    }
    
    return { display: formattedTime, className: minutesClass };
  }

  private formatNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private triggerAlertEffect(): void {
    const minutesElement = document.querySelector('.token-expiration-display');
    if (minutesElement) {
      minutesElement.classList.add('alert');
      setTimeout(() => {
        minutesElement.classList.remove('alert');
      }, 1000);
    }
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



}
