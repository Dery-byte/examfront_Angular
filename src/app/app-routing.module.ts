import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UserDashboardComponent } from './pages/user/user-dashboard/user-dashboard.component';
import { AdminGuard } from './services/admin.guard';
import { NormalGuard } from './services/normal.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { ViewCategoriesComponent } from './pages/admin/view-categories/view-categories.component';
import { AddCategoryComponent } from './pages/admin/add-category/add-category.component';
import { ViewQuizzesComponent } from './pages/admin/view-quizzes/view-quizzes.component';
import { AddQuizComponent } from './pages/admin/add-quiz/add-quiz.component';
// import { UpdateQuizComponent } from './pages/admin/update-quiz/update-quiz.component';
import { ViewQuizQuestionsComponent } from './pages/admin/view-quiz-questions/view-quiz-questions.component';
import { AddQuestionComponent } from './pages/admin/add-question/add-question.component';
import { LoadQuizComponent } from './pages/user/load-quiz/load-quiz.component';
import { InstructionsComponent } from './pages/user/instructions/instructions.component';
import { StartComponent } from './pages/user/start/start.component';
// import { UpdateCategoryComponent } from './pages/admin/update-category/update-category.component';
import { PrintQuizComponent } from './pages/user/print-quiz/print-quiz.component';
// import { UpdateQuestionComponent } from './pages/admin/update-question/update-question.component';
import { RegisterCoursesComponent } from './pages/user/register-courses/register-courses.component';
import { CoursesRegisteredComponent } from './pages/user/courses-registered/courses-registered.component';
import { AvailableQuizzesComponent } from './pages/user/available-quizzes/available-quizzes.component';
import { UserLayoutComponent } from './pages/layouts/user-layout/user-layout.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LectdashboardComponent } from './pages/lecturer/lectdashboard/lectdashboard.component';
import { LectwelcomeComponent } from './pages/lecturer/lectwelcome/lectwelcome.component';
import { LecturerLayoutComponent } from './pages/layouts/lecturer-layout/lecturer-layout.component';
import { ViewCourseComponent } from './pages/lecturer/view-course/view-course.component';
import { AddCourseComponent } from './pages/lecturer/add-course/add-course.component';
import { LectviewQuizzesComponent } from './pages/lecturer/lectview-quizzes/lectview-quizzes.component';
import { LectaddQuizComponent } from './pages/lecturer/lectadd-quiz/lectadd-quiz.component';
import { LectViewQuizQuestionComponent } from './pages/lecturer/lect-view-quiz-question/lect-view-quiz-question.component';
import { StudentsComponent } from './pages/admin/students/students.component';
import { LecturersComponent } from './pages/admin/lecturers/lecturers.component';
// import { StartQuizComponent } from './pages/user/start-quiz/start-quiz.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'signup',
    component: SignupComponent,
    pathMatch: 'full',
  },
  {

    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
    // canActivate: [AdminGuard],

  },
  {

    path: 'reset-password',
    component: ResetPasswordComponent,
    pathMatch: 'full',
    // canActivate: [AdminGuard],

  },

  {
    path: 'admin',
    component: DashboardComponent,
    // pathMatch:'full',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        component: WelcomeComponent,
      }
      ,
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'courses',
        component: ViewCategoriesComponent,
      },
      {
        path: 'add-course',
        component: AddCategoryComponent,
      },
      {
        path: 'quizzes',
        component: ViewQuizzesComponent,
      }, {
        path: 'add-quiz',
        component: AddQuizComponent,
      },
   
      {
        path: 'view-quetions/:qId/:qTitle',
        component: ViewQuizQuestionsComponent,
      },
      {
        path: 'add-question/:qId/:title',
        component: AddQuestionComponent,
      },

       {
        path: 'students',
        component: StudentsComponent,
      },

       {
        path: 'lecturers',
        component: LecturersComponent,
      }
    ]
  },



{
    path: 'lect',
    component: LectdashboardComponent,
    // pathMatch:'full',
    // canActivate: [AdminGuard],
    children: [
      {
        path: '',
        component: LectwelcomeComponent,
      }
      ,
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'courses',
        component: ViewCourseComponent,
      },
        {
        path: 'quizes',
        component: LectviewQuizzesComponent,
      },
        {
        path: 'view-quetions/:qId/:qTitle',
        component: LectViewQuizQuestionComponent,
      },
        {
        path: 'add-course',
        component: AddCourseComponent,
      },

        {
        path: 'add-question/:qId/:title',
        component: AddQuestionComponent,
      },
        {
        path: 'add-quizes',
        component: LectaddQuizComponent,
      }
    ]
  },







  {
    path: 'user-dashboard',
    // path:'user',
    component: UserLayoutComponent,
    // path:'register-courses',
    // component:RegisterCoursesComponent,
    canActivate: [NormalGuard],
    children: [
      // { path: '', redirectTo: 'courses', pathMatch: 'full' }, // Default redirect
      { path: 'user-dashboard', component: UserDashboardComponent }, // 👈 Loads instead of redirecting


      {
        path: 'register',
        component: RegisterCoursesComponent,
      },

      {
        path: 'courses',
        component: CoursesRegisteredComponent,
      },

      {
        path: 'quizzes',
        component: AvailableQuizzesComponent,
      },

      {
        path: ':catId',
        component: LoadQuizComponent,
      },
      {
        path: 'instructions/:qid',
        component: InstructionsComponent,
      },

    ],
  }
  ,
  {
    path: 'start/:qid',
    component: StartComponent,
    // canActivate: [NormalGuard],
  },





  // {
  //   path:'start-quiz/:qid',
  //   component:StartQuizComponent,
  //   canActivate: [NormalGuard],
  // },
  {
    path: 'print_quiz/:qid',
    component: PrintQuizComponent,
    canActivate: [NormalGuard],
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
