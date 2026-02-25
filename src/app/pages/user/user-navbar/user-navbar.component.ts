import { Component, NgZone, ViewChild, TemplateRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { LoginService } from 'src/app/services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { MailServiceService } from 'src/app/services/mail-service.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


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



    private expirationSubscription?: Subscription;
    private loginStatusSubscription?: Subscription;
    private breakpointSubscription?: Subscription;
	    private routerSubscription?: Subscription;


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




  // ── User ──────────────────────────────────────────────────────

  // ── Sidebar state ─────────────────────────────────────────────
  sidebarOpen = true;   // desktop: open by default
  mobileOpen  = false;  // mobile overlay drawer

  // ── Session timer ─────────────────────────────────────────────
  // These match your existing timeLeftDisplay / timeDisplay bindings
  timeDisplay: any     = { display: '--:--' };

  // ── Loading ───────────────────────────────────────────────────
  loading = false;

  private timerInterval: any;





  // ── Viewport check ────────────────────────────────────────────
  @HostListener('window:resize')
  checkViewport(): void {
    this.isMobile   = window.innerWidth <= 768;
    this.sidebarOpen = !this.isMobile;
    if (this.isMobile) this.mobileOpen = false;
  }

  // ── Sidebar toggle ────────────────────────────────────────────
  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }



	

	ngOnInit(): void {
		    this.checkViewport();

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

	  this.breakpointSubscription = this.breakpointObserver
            .observe([Breakpoints.Handset])
            .subscribe(result => {
                this.isMobile = result.matches;
                if (this.drawer) {  // ✅ Check existence
                    this.isMobile ? this.drawer.close() : this.drawer.open();
                }
            });

				// Auto-close drawer on route changes (mobile only)
		this.routerSubscription = this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.closeDrawerOnMobile();
			});
	}


	// ✅ Move breakpoint observer to AfterViewInit to ensure drawer is initialized
	ngAfterViewInit(): void {
		this.breakpointSubscription = this.breakpointObserver
			.observe([Breakpoints.Handset])
			.subscribe(result => {
				this.isMobile = result.matches;
				
				// ✅ Drawer is guaranteed to be initialized here
				if (this.drawer) {
					if (this.isMobile) {
						this.drawer.close();
					} else {
						this.drawer.open();
					}
				}
			});
	}


	//    closeDrawerOnMobile(): void {
    //     if (this.isMobile) {
    //         this.drawer?.close();
    //     }
    // }

		closeDrawerOnMobile(): void {
		if (this.isMobile && this.drawer) {
			this.drawer.close();
		}
	}



	private checkAuthority(authority: string): boolean {
		return this.user?.authorities?.some((auth: any) => auth.authority === authority) ?? false;
	}

	//TRYING THE TIMER

	private hasLoggedOut = false;

	

	startCountdown(): void {
		this.tokenExpirationService.startCountdownFromBackend();

		this.expirationSubscription = this.tokenExpirationService.expiration$.subscribe(
			(seconds) => {
				console.log("⏱️ Countdown seconds:", seconds);

				if (seconds === 0) {
					// Token expired - show expired state then trigger modal
					this.logout();
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


	// Add this method to properly clean up
private stopCountdown(): void {
    if (this.expirationSubscription) {
        this.expirationSubscription.unsubscribe();
        this.expirationSubscription = null;
    }
}

// Call this in ngOnDestroy

	onModalConfirm(): void {
		console.log("👋 User confirmed logout");
		//   this.showExpirationModal = false;

		// Small delay for better UX
		setTimeout(() => {
			this.logout();
		}, 300);
	}
logout(): void {
  // Service handles backend call, clearing session, and redirect
  this.login.logout();
  
  // Update component state
  this.isloggedIn = false;
  this.user = null;
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



	    ngOnDestroy(): void {
        this.stopCountdown();
          this.stopCountdown();
		if (this.expirationSubscription) {
			this.expirationSubscription.unsubscribe();
		}
		// Clear the interval when the component is destroyed to prevent memory leaks
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
        // ✅ Clean up all subscriptions
        this.loginStatusSubscription?.unsubscribe();
        this.breakpointSubscription?.unsubscribe();
    }




}
