import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { RegCoursesService } from 'src/app/services/reg-courses.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-courses-registered',
  templateUrl: './courses-registered.component.html',
  styleUrls: ['./courses-registered.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesRegisteredComponent implements OnInit, OnDestroy {

  // ── State ────────────────────────────────────────────────────────
  userRecords: any[] = [];
  isLoading   = false;
  isDeleting  = false;
  filterQuery = '';

  // ── Private ──────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();
  private userId: string | null = null;

  constructor(
    private readonly regCourse: RegCoursesService,
    private readonly snack: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadRegisteredCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Template helper: filtered rows ───────────────────────────────
  getFiltered(): any[] {
    const q = this.filterQuery.trim().toLowerCase();
    if (!q) return this.userRecords;
    return this.userRecords.filter(r =>
      r.category?.courseCode?.toLowerCase().includes(q) ||
      r.category?.title?.toLowerCase().includes(q)
    );
  }

  // ── Load ─────────────────────────────────────────────────────────
  loadRegisteredCourses(): void {
    this.isLoading = true;

    this.regCourse.getRegCourses()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data: any[]) => {
          this.userRecords = this.filterByCurrentUser(data);
        },
        error: () => {
          this.notify('Failed to load courses. Please try again.');
        },
      });
  }

  // ── Delete ───────────────────────────────────────────────────────
  deleteRegCourse(rid: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Remove this course?',
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      background: '#0a0a0a',
      color: '#fff',
    }).then(result => {
      if (result.isConfirmed) this.executeDelete(rid);
    });
  }

  // ── Private helpers ──────────────────────────────────────────────
  private executeDelete(rid: number): void {
    this.isDeleting = true;

    this.regCourse.deleteRegCourse(rid)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDeleting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.userRecords = this.userRecords.filter(r => r.rid !== rid);
          this.notify('Course removed successfully.');
        },
        error: () => {
          this.notify('Failed to remove course. Please try again.');
        },
      });
  }

  private filterByCurrentUser(courses: any[]): any[] {
    const raw = localStorage.getItem('user');
    if (!raw) return [];
    try {
      const user = JSON.parse(raw);
      this.userId = user.id;
      return courses.filter(c => c.user?.id === this.userId);
    } catch {
      return [];
    }
  }

  private notify(message: string): void {
    this.snack.open(message, '', { duration: 3000 });
  }
}