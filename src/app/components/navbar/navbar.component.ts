import { Component, OnInit, HostListener } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isloggedIn = false;
   user=null;
   expirationSeconds: any;
	timeDifferenceInSeconds: any;
	jwtToken: string;
  private tokenExpirationKey = 'tokenExpirationTime';
  constructor(public login: LoginService, private tokenExpirationService: TokenExpirationService,){
  }


  @HostListener('window:beforeunload', ['$event'])
	beforeUnloadHandler(event: Event): void {
		// Custom code to be executed before the page is unloaded
		localStorage.setItem(this.tokenExpirationKey, JSON.stringify(this.expirationSeconds));
		console.log(this.expirationSeconds);
		// event.preventDefault();
		// this.preventBackButton();
		// event.returnValue = '' as any; // This is required for some older browsers
	}
	@HostListener('window:unload', ['$event'])
	unloadHandler(event: Event): void {
		// this.preventBackButton();
	}

  ngOnInit():void{
    this.isloggedIn = this.login.isLoggedIn();
    this.user = this.login.getUser();
    this.login.loginStatusSubject.asObservable().subscribe(data=>{
      this.isloggedIn = this.login.isLoggedIn();
      // this.user = this.login.getUser();
    }); 

    this.expirationFromServer();
		this.startTimer();
		this.formattedExpirationTime();
  }


  public logout(){
    this.login.logout();
    this.isloggedIn=false;
    this.user = null;
    // window.location.reload();
    window.location.href="/login"; 

  }
  formattedExpirationTime() {
		this.jwtToken = localStorage.getItem('token')
		const tokenParts = this.jwtToken.split('.');
		console.log(this.jwtToken);

		if (tokenParts.length !== 3) {
			console.error('Invalid JWT format');
			return null;
		}

		const payload = JSON.parse(atob(tokenParts[1]));

		if (!payload || !payload.exp) {
			console.error('Expiration time not found in JWT');
			return null;
		}

		const expirationTimeInSeconds = payload.exp;
		const expirationDate = new Date(expirationTimeInSeconds * 1000); // Convert to milliseconds
		const currentTime = new Date();
		const timeDifferenceInSeconds = Math.floor((expirationDate.getTime() - currentTime.getTime()) / 1000);
		console.log(timeDifferenceInSeconds);
		console.log(typeof (timeDifferenceInSeconds));

		console.log(expirationDate.toLocaleString());

		return timeDifferenceInSeconds; // Adjust the format as needed
	}


	// THIS JWT EXPIRATION NOT OPTIMIZED

	expirationFromServer() {
		// const expirationTimeFromServer = 120; // 15 minutes in seconds
		const expirationTimeFromServers = this.formattedExpirationTime();

		console.log(expirationTimeFromServers);

		this.tokenExpirationService.startCountdown(expirationTimeFromServers);

		this.startTimer();

		this.tokenExpirationService.expiration$.subscribe(seconds => {
			this.expirationSeconds = seconds;

			//   const remainingTime = this.tokenExpirationService.getRemainingTime();
			let timerString = localStorage.getItem(this.tokenExpirationKey);
			const timerNumber = parseInt(timerString, 10);

			if (timerNumber) {
				this.expirationSeconds = timerNumber;
				this.tokenExpirationService.startCountdown(this.expirationSeconds);

				console.log(timerNumber)
				console.log(typeof (timerNumber));
				localStorage.removeItem(this.tokenExpirationKey);

				// Start the countdown again with the remaining time
				// this.tokenExpirationService.startCountdown(this.expirationSeconds);
				// this.startTimer();
			} else {
				// Handle the case when there is no remaining time (e.g., user refreshed after expiration)
				// this.tokenExpirationService.startCountdown(this.expirationSeconds);
				// console.log('Token has expired.');
			}
		});
	}



  startTimer() {
		let t = window.setInterval(() => {
			//Code
			if (this.expirationSeconds <= 0) {
				this.login.logout();
				// window.location('/login')
				window.location.href = "/login";
				clearInterval(t);

			}
			else {
				// this.expirationSeconds--;
			}
		}, 1000);
	}
	getFormmatedTime() {
		let mm = Math.floor(this.expirationSeconds / 60);
		let ss = this.expirationSeconds - mm * 60;
		return `${mm} min : ${ss} sec`
	}
}
