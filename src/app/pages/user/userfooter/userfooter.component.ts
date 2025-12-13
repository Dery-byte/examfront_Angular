import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-userfooter',
  templateUrl: './userfooter.component.html',
  styleUrls: ['./userfooter.component.css'],
   animations: [
      trigger('fadeIn', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('300ms ease-out', style({ opacity: 1 }))
        ])
      ])
    ]
})
export class UserfooterComponent {

}
