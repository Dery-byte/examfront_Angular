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

import { MailServiceService } from 'src/app/services/mail-service.service';






interface TimeDisplay {
	display: string;
	className: string;
}

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
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
	timeLeftDisplay: TimeDisplay | string;
	private intervalId: any; // To store the interval reference

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
	) {
	}


	@ViewChild('autosize') autosize: CdkTextareaAutosize;

	triggerResize() {
		// Wait for changes to be applied, then trigger textarea resize.
		this.ngZone.onStable.pipe(take(1))
			.subscribe(() => this.autosize.resizeToFitContent(true));
	}


	ngOnDestroy(): void {
		// Clear the interval when the component is destroyed to prevent memory leaks
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
	ngOnInit(): void {
		this.isloggedIn = this.login.isLoggedIn();
		this.startCountdown();
		this.user = this.login.getUser();
		this.login.loginStatusSubject.asObservable().subscribe(data => {
			this.isloggedIn = this.login.isLoggedIn();


			// this.user = this.login.getUser();
		});

		this._cat.getCategories().subscribe((data: any) => {
			this.categories = data;
		},
			(error) => {
				this._snack.open("Couldn't load Categories from Server", "", {
					duration: 3000
				})
			});

	}

	dialogRef!: MatDialogRef<any>;



	public logout() {
		this.login.logout();
		this.isloggedIn = false;
		this.user = null;
		window.location.reload();
		// window.location.href = "/login";

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
