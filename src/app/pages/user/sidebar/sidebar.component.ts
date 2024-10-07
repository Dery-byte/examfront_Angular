import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { LoginService } from 'src/app/services/login.service';
import { MatMenuModule} from '@angular/material/menu';




@Component({
  selector: 'app-sidebar-user',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent  implements OnInit{

  categories;
  constructor(private _cat: CategoryService, 
    private _snack:MatSnackBar,
    private login: LoginService,
  ){}



  // badgevisible = false;
  // badgevisibility() {
  //   this.badgevisible = true;
  // }
  
  ngOnInit(): void {
//     this._cat.getCategories().subscribe((data:any)=>{
// this.categories=data;
//     },
//     (error)=>{
// this._snack.open("Couldn't load Categories from Server","",{
//   duration:3000
// })
//     });
    
  }


  // public logout(){
  //   this.login.logout();
  //   // this.isloggedIn=false;
  //   // this.user = null;
  //   window.location.reload();
  // }



}
