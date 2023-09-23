import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-resetpopup',
  templateUrl: './resetpopup.component.html',
  styleUrls: ['./resetpopup.component.css']
})
export class ResetpopupComponent {

  constructor(private ref: MatDialogRef<ResetpopupComponent>, private builder: FormBuilder) { }

  closepoup() {
    this.ref.close();
  }

  resetpassform = this.builder.group({
    username: this.builder.control(''),
    email: this.builder.control(''),
    newPassword: this.builder.control(''),
    confirmNewpassword: this.builder.control(''),

  })

  savePassword() {

    console.log(this.resetpassform.value);

    this.closepoup()
  }

}
