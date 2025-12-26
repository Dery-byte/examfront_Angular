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

	private subscription?: Subscription;


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
		this.subscription?.unsubscribe();

		// Clear the interval when the component is destroyed to prevent memory leaks
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	ngOnInit(): void {
		this.isloggedIn = this.login.isLoggedIn();
		this.tokenExpirationService.startCountdownFromBackend();
		// this.startCountdown();
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


	private hasLoggedOut = false;


	startCountdown(): void {
		this.subscription = this.tokenExpirationService.expiration$
			.subscribe(secondsLeft => {

				if (secondsLeft > 0) {
					const minutesLeft = Math.floor((secondsLeft % 3600) / 60);
					this.timeLeftDisplay = this.formatTime(secondsLeft, minutesLeft);

					if (minutesLeft <= 5) {
						this.triggerAlertEffect();
					}
				} else if (!this.hasLoggedOut) {
					// 🔐 LOGOUT ONLY ONCE
					this.hasLoggedOut = true;

					this.timeLeftDisplay = {
						display: 'Your session has expired.',
						className: ''
					};

					this.logout();
				}

			});
	}

	//TRYING THE TIMER
	// Add a method to handle alert effect
	private triggerAlertEffect(): void {
		const alertClass = 'alert';
		const minutesElement = document.querySelector('.minutes-display');

		if (minutesElement) {
			minutesElement.classList.add(alertClass);
			setTimeout(() => {
				minutesElement.classList.remove(alertClass);
			}, 1000);
		}
	}


	private formatTime(timeInSeconds: number, minutesLeft: number): TimeDisplay {
		const hr = Math.floor(timeInSeconds / 3600);
		const mm = Math.floor((timeInSeconds % 3600) / 60);
		const ss = Math.floor(timeInSeconds % 60);

		let formattedTime = '';
		if (hr > 0) {
			formattedTime += `${this.formatNumber(hr)} hr(s) : `;
		}

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
