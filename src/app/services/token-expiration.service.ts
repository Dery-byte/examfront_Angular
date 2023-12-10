import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenExpirationService {

  constructor() { }


  // @HostListener('window:beforeunload', ['$event'])
	// 	beforeUnloadHandler(event: Event): void {
	// 	  // Custom code to be executed before the page is unloaded
	// 	  localStorage.setItem(this.countdownKey, JSON.stringify(this.expirationSeconds));
	// 	  event.preventDefault();
	// 	  // this.preventBackButton();
	  
	// 	  event.returnValue = '' as any; // This is required for some older browsers
	// 	}
	  
	// 	@HostListener('window:unload', ['$event'])
	// 	unloadHandler(event: Event): void {
	// 	  // this.preventBackButton();
	// 	}


  private expirationSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  expiration$: Observable<number> = this.expirationSubject.asObservable();

  startCountdown(expirationInSeconds: number): void {
    const expirationTime = new Date().getTime() + expirationInSeconds * 1000;
    // localStorage.setItem('tokenExpirationTime', expirationTime.toString());
    timer(0, 1000)
      .pipe(
        map(() => Math.max(0, Math.floor((expirationTime - new Date().getTime()) / 1000))),
        takeWhile(seconds => seconds > 0)
      )
      .subscribe(seconds => {
        this.expirationSubject.next(seconds);
      });
  }


  // getRemainingTime(): number {
  //   const expirationTime = localStorage.getItem('tokenExpirationTime');
  //   if (expirationTime) {
  //     const remainingSeconds = Math.max(0, Math.floor((+expirationTime - new Date().getTime()) / 1000));
  //     return remainingSeconds;
  //   }
  //   return 0;
  // }
}
