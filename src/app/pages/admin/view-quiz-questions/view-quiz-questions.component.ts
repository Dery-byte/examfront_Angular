
import { Component, TemplateRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as ClassisEditor from '@ckeditor/ckeditor5-build-classic';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quiz-questions',
  templateUrl: './view-quiz-questions.component.html',
  styleUrls: ['./view-quiz-questions.component.css']
})
export class ViewQuizQuestionsComponent implements OnInit {

  public Editor = ClassisEditor;

  // ── Route params ─────────────────────────────────────────────────────────────
  qId:    any;
  qTitle: any;
  Tqid:   any;

  // ── Section A — all objective questions ──────────────────────────────────────
  questions: any[] = [];

  // ── Section B — theory ───────────────────────────────────────────────────────
  sectionB:                    any[] = [];
  theory:                      any;
  specificSectionB:            any;
  numberOfquestionsToAnswer:   any;
  numberOfquestionsToAnswers:  any;

  // ── Dialog state ──────────────────────────────────────────────────────────────
  dialogRef!: MatDialogRef<any>;
  specificObj: any;

  specificObjective: any = {
    quesId:        null,
    content:       '',
    questionType:  'MCQ',
    option1:       '',
    option2:       '',
    option3:       '',
    option4:       '',
    correct_answer: [],
    matchingPairs:  [],
  };

  updateNumberOfquestionsToAnswer = {
    totalQuestToAnswer: '',
    timeAllowed: '',
    quiz: { qId: '' }
  };

  // ── Compulsory tracking (Section B) ──────────────────────────────────────────
  compulsoryPrefixes:   { [key: string]: boolean } = {};
  isUpdatingCompulsory: { [key: string]: boolean } = {};

  // ═══════════════════════════════════════════════════════════════════════════════
  // Grouped question getters — used directly in the HTML with *ngIf / *ngFor
  // ═══════════════════════════════════════════════════════════════════════════════

  get mcqQuestions(): any[] {
    return this.questions.filter(q => q.questionType === 'MCQ' || !q.questionType);
  }

  get trueFalseQuestions(): any[] {
    return this.questions.filter(q => q.questionType === 'TRUE_FALSE');
  }

  get matchingQuestions(): any[] {
    return this.questions.filter(q => q.questionType === 'MATCHING');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  constructor(
    private _route:    ActivatedRoute,
    private _question: QuestionService,
    private _snack:    MatSnackBar,
    private _router:   Router,
    private login:     LoginService,
    public  dialog:    MatDialog
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.qId    = this._route.snapshot.params['qId'];
    this.Tqid   = this._route.snapshot.params['tqId'];
    this.qTitle = this._route.snapshot.params['qTitle'];

    // Section A
    this._question.getQuestionsOfQuizforAdmin(this.qId).subscribe({
      next:  (data: any) => { this.questions = data; },
      error: ()          => console.error('Failed to load Section A')
    });

    // Section B
    this._question.getSubjective(this.qId).subscribe({
      next: (theory: any) => {
        this.sectionB = theory;
        this.initializeCompulsoryStatus();
      },
      error: () => {
        this._snack.open("Session expired. Please log in again.", '', { duration: 3000 });
        this.login.logout();
      }
    });

    // Theory question count
    this._question.getNumerOfQuesToAnswer(this.qId).subscribe({
      next:  (data: any) => { this.numberOfquestionsToAnswers = data; },
      error: ()          => console.error('Failed to load number of questions to answer')
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Section B helpers
  // ═══════════════════════════════════════════════════════════════════════════════
initializeCompulsoryStatus(): void {
  this.getPrefixes().forEach(prefix => {
    const qs = this.getGroupedQuestions(prefix);
    this.compulsoryPrefixes[prefix] = qs.some(q => q.compulsory === true || q.isCompulsory === true);
  });
}
  // initializeCompulsoryStatus(): void {
  //   this.getPrefixes().forEach(prefix => {
  //     const qs = this.getGroupedQuestions(prefix);
  //     this.compulsoryPrefixes[prefix] = qs.some(q => q.isCompulsory === true);
  //   });
  // }

  getPrefixes(): string[] {
    const prefixes = new Set<string>();
    this.sectionB.forEach(q => {
      const match = q.quesNo.match(/^Q\d+/)?.[0];
      if (match) prefixes.add(match);
    });
    return Array.from(prefixes).sort();
  }

  getGroupedQuestions(prefix: string): any[] {
    return this.sectionB.filter(q => q.quesNo.startsWith(prefix));
  }

  onCompulsoryChange(prefix: string, isCompulsory: boolean): void {
    this.isUpdatingCompulsory[prefix] = true;
    this._question.setCompulsoryQuestion(this.qId, prefix, isCompulsory).subscribe({
      next: () => {
        this.getGroupedQuestions(prefix).forEach(q => q.isCompulsory = isCompulsory);
        this.isUpdatingCompulsory[prefix] = false;
        this._snack.open(`${prefix} updated.`, '', { duration: 3000 });
      },
      error: () => {
        this.compulsoryPrefixes[prefix] = !isCompulsory; // revert
        this.isUpdatingCompulsory[prefix] = false;
        this._snack.open(`Failed to update ${prefix}.`, '', { duration: 3000 });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Section A — open update dialog
  // ═══════════════════════════════════════════════════════════════════════════════

  openUpdateObjDialog(objId: any, templateRef: TemplateRef<any>): void {
    this._question.getSpecificObj(objId).subscribe((data: any) => {
      // Deep-clone matchingPairs so unsaved edits don't mutate the list
      this.specificObjective = {
        ...data,
        questionType:   data.questionType   ?? 'MCQ',
        correctAnswer: data.correctAnswer ?? [],
        matchingPairs:  data.matchingPairs
          ? data.matchingPairs.map((p: any) => ({ ...p }))
          : [],
      };

      this.dialogRef = this.dialog.open(templateRef, {
        width: '850px',
        data:  this.specificObjective,
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (result) this.specificObjective = result;
      });
    });
  }

  // ── Send update — payload varies by type ────────────────────────────────────
  updateQuestionData(): void {
    const payload: any = {
      quesId:       this.specificObjective.quesId,
      content:      this.specificObjective.content,
      questionType: this.specificObjective.questionType,
    };

    switch (this.specificObjective.questionType) {

      case 'MATCHING':
        payload.matchingPairs = this.specificObjective.matchingPairs.map(
          (p: any, i: number) => ({ ...p, pairOrder: i })
        );
        break;

      case 'TRUE_FALSE':
        payload.option1        = 'True';
        payload.option2        = 'False';
        payload.option3        = null;
        payload.option4        = null;
        payload.correct_answer = this.specificObjective.correctAnswer;
        break;

      default: // MCQ
        payload.option1        = this.specificObjective.option1;
        payload.option2        = this.specificObjective.option2;
        payload.option3        = this.specificObjective.option3;
        payload.option4        = this.specificObjective.option4;
        payload.correct_answer = this.specificObjective.correctAnswer;
        break;
    }

    this._question.updateQuestion(payload).subscribe({
      next: () => {
        this._snack.open('Question updated successfully!', '', { duration: 3000 });
        this.dialogRef.close(this.specificObjective);
        this.ngOnInit();
      },
      error: () => this._snack.open("Question couldn't be updated.", '', { duration: 3000 })
    });
  }

  // ── Matching pair helpers (bound to dialog template buttons) ────────────────
  addMatchingPair(): void {
    this.specificObjective.matchingPairs.push({
      prompt:    '',
      answer:    '',
      pairOrder: this.specificObjective.matchingPairs.length,
    });
  }

  removeMatchingPair(index: number): void {
    this.specificObjective.matchingPairs.splice(index, 1);
    this.specificObjective.matchingPairs.forEach((p: any, i: number) => p.pairOrder = i);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Section A — delete
  // ═══════════════════════════════════════════════════════════════════════════════

  deleteQuestion(quesId: any): void {
    Swal.fire({
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      title: 'Are you sure you want to delete this question?',
    }).then(result => {
      if (result.isConfirmed) {
        this._question.deleteQuestion(quesId).subscribe({
          next: () => {
            this._snack.open('Question deleted.', '', { duration: 3000 });
            this.questions = this.questions.filter(q => q.quesId !== quesId);
          },
          error: () => this._snack.open("Couldn't delete question.", '', { duration: 3000 })
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Section B — theory dialogs
  // ═══════════════════════════════════════════════════════════════════════════════

  openUpdateDialog(questionId: any, templateRef: TemplateRef<any>): void {
    this._question.getSpecificSubjective(questionId).subscribe((data: any) => {
      this.theory = data;
      this.dialogRef = this.dialog.open(templateRef, { width: '350px', data: this.theory });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) this.theory = result;
      });
    });
  }

  updateTheoryQuestion(): void {
    this._question.updateTheoryQuestions(this.theory).subscribe({
      next: () => {
        this._snack.open('Question updated successfully!', '', { duration: 3000 });
        this.dialogRef.close(this.theory);
        this.ngOnInit();
      },
      error: () => this._snack.open("Couldn't update question.", '', { duration: 3000 })
    });
  }

  deleteTheoryQuestion(tqId: any): void {
    Swal.fire({
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      title: 'Are you sure you want to delete this question?',
    }).then(result => {
      if (result.isConfirmed) {
        this._question.deleteTheoryQuestion(tqId).subscribe({
          next: () => {
            this._snack.open('Question deleted.', '', { duration: 3000 });
            this.sectionB = this.sectionB.filter(q => q.tqId !== tqId);
          },
          error: () => this._snack.open("Couldn't delete question.", '', { duration: 3000 })
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Section B — theory question count dialog
  // ═══════════════════════════════════════════════════════════════════════════════

  openUpdateNumberDialog(qId: any, templateRef: TemplateRef<any>): void {
    this._question.getNumerOfQuesToAnswerBy(this.qId).subscribe((data: any) => {
      this.numberOfquestionsToAnswer = data;
      this.dialogRef = this.dialog.open(templateRef, { width: '350px', data });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) this.numberOfquestionsToAnswer = result;
      });
    });
  }

  updateTheoryNumberOfQuesToAnswer(): void {
    this._question.updateTheoryNumberOfQuestionsToAnswer(this.numberOfquestionsToAnswer[0]).subscribe({
      next: () => {
        this._snack.open('Update successful!', '', { duration: 3000 });
        this.dialogRef.close(this.numberOfquestionsToAnswer[0]);
        this.ngOnInit();
      },
      error: () => this._snack.open('Update unsuccessful.', '', { duration: 3000 })
    });
  }
}
