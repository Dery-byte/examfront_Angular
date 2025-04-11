import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
declare var $: any;  // If you're using jQuery


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
export class HomeComponent implements OnInit {
  CourseOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    dotsEach:true,
    autoplay:true,
    navSpeed: 500,
    // nav:false,
    // navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 2
      },
      1000: {
        items: 3
      }
    },
    nav: false
  };


  carouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay:true,
    dots: true,
    navSpeed: 700,
    // navText: [ '<span class="custom-nav-btn left-btn"><span></span><span></span><span></span></span>',
    //   '<span class="custom-nav-btn right-btn"><span></span><span></span><span></span></span>'],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 2
      }
    },
    nav: false
  }


  ngOnInit(): void {
    this.loadScript('assets/homecss/js/jquery-3.2.1.min.js');
    this.loadScript('assets/homecss/js/popper.js');
    this.loadScript('assets/homecss/js/bootstrap.min.js');
    
    this.loadScript('assets/homecss/vendors/nice-select/js/jquery.nice-select.min.js');
   // This is causing the "Client say about Us content not to show" and "Our Popular Courses"
    this.loadScript('assets/homecss/js/owl-carousel-thumb.min.js');
    this.loadScript('assets/homecss/js/jquery.ajaxchimp.min.js');
    this.loadScript('assets/homecss/js/mail-script.js');


    this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCjCGmQ0Uq4exrzdcL6rvxywDDOvfAu6eE');
    this.loadScript('assets/homecss/js/gmaps.min.js');
    this.loadScript('assets/homecss/js/theme.js');

  }

  loadScript(scriptUrl: string): void {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
  }

}CloseScrollStrategy

