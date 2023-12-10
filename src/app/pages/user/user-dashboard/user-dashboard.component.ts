import { Component, OnInit, HostListener } from '@angular/core';
import { LocationStrategy } from '@angular/common';


@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit{


  constructor(
    private locationSt:LocationStrategy, 
    
   ){}


  //  @HostListener('window:beforeunload', ['$event'])
  //  beforeUnloadHandler(event: Event): void {
  //    event.preventDefault();
  //    event.returnValue = '' as any; // This is required for some older browsers
  //  }
  //  @HostListener('window:unload', ['$event'])
  //  unloadHandler(event: Event): void {
  //    this.preventBackButton();
 
  //  }

  ngOnInit(): void {
    this.preventBackButton();
  }

  preventBackButton(){
    history.pushState(null,null,location.href);
    this.locationSt.onPopState(()=>{
history.pushState(null,null,location.href);
    });
  }
}
