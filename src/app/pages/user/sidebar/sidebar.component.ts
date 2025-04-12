import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { LoginService } from 'src/app/services/login.service';
import { MatMenuModule} from '@angular/material/menu';
import { Component, NgZone, ViewChild, TemplateRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { TokenExpirationService } from 'src/app/services/token-expiration.service';

import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';

import { MailServiceService } from 'src/app/services/mail-service.service';





@Component({
  selector: 'app-sidebar-user',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent  implements OnInit{

  emailFormControl = new FormControl('', [
		Validators.required,
		Validators.email,
	]);

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


  badgevisible = false;
  badgevisibility() {
    this.badgevisible = true;
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

	triggerResize() {
		// Wait for changes to be applied, then trigger textarea resize.
		this.ngZone.onStable.pipe(take(1))
			.subscribe(() => this.autosize.resizeToFitContent(true));
	}

  
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


  public logout(){
    this.login.logout();
    // this.isloggedIn=false;
    // this.user = null;
    window.location.reload();
  }

  dialogRef!: MatDialogRef<any>;

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
