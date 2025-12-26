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
 isLoggingOut = false;  // Prevent multiple logout calls
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

		this.expirationSubscription = this.tokenExpirationService.expiration$.subscribe(
			(seconds) => {
				console.log("⏱️ Countdown seconds:", seconds);

				if (seconds === 0) {
					// Token expired - show expired state then trigger modal
					this.timeDisplay = { display: 'Session Expired', className: 'expired' };
					console.log("🚨 Token expired! Showing modal...");

					// Small delay to let the UI update before showing modal
					setTimeout(() => {
						this.handleTokenExpiration();
					}, 500);
				} else {
					// Update the display
					const minutesLeft = Math.floor(seconds / 60);
					this.timeDisplay = this.formatTime(seconds, minutesLeft);
					console.log("⏰ Time display:", this.timeDisplay);

					// Trigger alert effect when less than 1 minute left
					if (minutesLeft === 0 && seconds <= 60 && seconds > 0) {
						this.triggerAlertEffect();
					}

					// Optional: Show warning at 5 minutes
					if (seconds === 300) {
						console.log("⚠️ Warning: 5 minutes remaining!");
						// You could show a toast notification here
					}

					// Optional: Show critical warning at 1 minute
					if (seconds === 60) {
						console.log("🔴 Critical: 1 minute remaining!");
						// You could show another notification here
					}
				}
			},
			(error) => {
				console.error("❌ Error in countdown subscription:", error);
			},
			() => {
				console.log("✅ Countdown completed");
			}
		);
	}

	private handleTokenExpiration(): void {
		console.log("🔒 Handling token expiration - showing modal");
		// this.logout();
		//   this.showExpirationModal = true;
	}

	onModalConfirm(): void {
		console.log("👋 User confirmed logout");
		//   this.showExpirationModal = false;

		// Small delay for better UX
		setTimeout(() => {
			this.logout();
		}, 300);
	}

	public logout(): void {
    // Prevent multiple simultaneous logout calls
    if (this.isLoggingOut) {
      console.log("⏳ Logout already in progress...");
      return;
    }

    this.isLoggingOut = true;
    console.log("🚪 Logging out user...");

    // Unsubscribe from countdown
    if (this.expirationSubscription) {
      this.expirationSubscription.unsubscribe();
    }

    // Call backend logout endpoint
    this.login.logout().subscribe({
      next: (response) => {
        console.log("✅ Backend logout successful:", response);
        
        // Clear local session
        this.login.clearLocalSession();
        this.isloggedIn = false;
        this.user = null;
        
        // Redirect to login page
        console.log("🔄 Redirecting to login...");
        window.location.href = '/login';
      },
      error: (error) => {
        console.error("❌ Logout error:", error);
        
        // Even if backend fails, clear local session and redirect
        this.login.clearLocalSession();
        this.isloggedIn = false;
        this.user = null;
        
        // Still redirect to login
        window.location.href = '/login';
      }
	});
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
