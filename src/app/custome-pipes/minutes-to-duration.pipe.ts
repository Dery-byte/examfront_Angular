import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesToDuration',
  pure: true
})
export class MinutesToDurationPipe implements PipeTransform {

  transform(totalMinutes: number | string | null | undefined): string {
    const minutes = Number(totalMinutes);

    if (isNaN(minutes) || minutes <= 0) {
      return '0 Munites';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} hour(s) ${remainingMinutes} Minutes`;
    }

    if (hours > 0) {
      return `${hours} hour(s)`;
    }

    return `${remainingMinutes} Minutes`;
  }
}
