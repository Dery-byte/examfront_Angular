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
		// Clear the interval when the component is destroyed to prevent memory leaks
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
	ngOnInit(): void {

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


//   closeDrawerOnMobile() {
// 		// Check if screen width is small (you can adjust the breakpoint as needed)
// 		if (window.innerWidth < 768) {
// 			this.drawer.close();
// 		}
// 	}



	private checkAuthority(authority: string): boolean {
		return this.user?.authorities?.some((auth: any) => auth.authority === authority) ?? false;
	}

	//TRYING THE TIMER
	startCountdown() {
		const token = this.tokenExpirationService.getTokenFromLocalStorage();
		if (token) {
			this.intervalId = setInterval(() => {
				const timeLeftInSeconds = this.tokenExpirationService.getTimeLeft(token);
				if (timeLeftInSeconds > 0) {
					const minutesLeft = Math.floor((timeLeftInSeconds % 3600) / 60);
					this.timeLeftDisplay = this.formatTime(timeLeftInSeconds, minutesLeft);

					// Check if minutesLeft is 5 or less to trigger alert style
					if (minutesLeft <= 5) {
						this.triggerAlertEffect(); // Trigger alert effect
					}
				} else {
					// Stop countdown and notify the user that the session has expired
					this.logout();
					this.timeLeftDisplay = { display: 'Your session has expired.', className: '' };
					clearInterval(this.intervalId); // Stop the timer
				}
			}, 1000); // Update every second
		} else {
			this.timeLeftDisplay = { display: 'No session token found.', className: '' };
		}
	}

	public logout() {
		this.login.logout();
		this.isloggedIn = false;
		this.user = null;
		window.location.reload();
		// window.location.href = "/login";
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
