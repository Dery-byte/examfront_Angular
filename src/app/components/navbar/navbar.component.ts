import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isloggedIn = false;
   user=null;


  constructor(public login: LoginService){
  }

  ngOnInit():void{
    this.isloggedIn = this.login.isLoggedIn();
    this.user = this.login.getUser();
    this.login.loginStatusSubject.asObservable().subscribe(data=>{
      // this.isloggedIn = this.login.isLoggedIn();
      // this.user = this.login.getUser();
    }); 
  }


  public logout(){
    this.login.logout();
    this.isloggedIn=false;
    this.user = null;
    window.location.reload();
  }
}
