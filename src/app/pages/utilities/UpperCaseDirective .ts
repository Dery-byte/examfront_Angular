import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[upperCase]'
})
export class UpperCaseDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.ngControl.control?.setValue(value.toUpperCase(), {
      emitEvent: false
    });
  }
}
