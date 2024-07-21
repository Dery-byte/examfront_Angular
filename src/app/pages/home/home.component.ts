import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition('void => *', [
        style({ transform: 'translateY(-20px)' }),
        animate(1000, style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent {

}CloseScrollStrategy
