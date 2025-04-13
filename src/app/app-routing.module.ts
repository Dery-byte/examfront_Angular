import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
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
// import { StartQuizComponent } from './pages/user/start-quiz/start-quiz.component';

const routes: Routes = [
  {
    path: '',
    component : HomeComponent,
    pathMatch:'full',
  },
  {
    path: 'signup',
    component : SignupComponent,
    pathMatch:'full',
  },
  {

    path: 'login',
    component : LoginComponent,
    pathMatch:'full',
    // canActivate: [AdminGuard],

  },

  {
    path:'admin',
    component:DashboardComponent,
    // pathMatch:'full',
    canActivate: [AdminGuard],
    children:[
      {
        path:'',
        component:WelcomeComponent,
      }
      ,
      {
        path:'profile',
        component:ProfileComponent,
      },
      {
        path:'categories',
        component:ViewCategoriesComponent,
      },
      {
        path:'add-category',
        component:AddCategoryComponent,
      },
      // {
      //   path:'update-category/:cid',
      //   component:UpdateCategoryComponent,
      // },
       {
        path:'quizzes',
        component:ViewQuizzesComponent,
      },  {
        path:'add-quiz',
        component:AddQuizComponent,
      },
      // {
      //   path:'update-quiz/:qid',
      //   component:UpdateQuizComponent,
      // },
      {
        path:'view-quetions/:qId/:qTitle',
        component:ViewQuizQuestionsComponent,
      },
      {
        path:'add-question/:qId/:title',
        component:AddQuestionComponent,
      },
    ]
  },

  
  {
    path:'user-dashboard',
      // path:'user',
    component:UserLayoutComponent,
    // path:'register-courses',
    // component:RegisterCoursesComponent,
    canActivate: [NormalGuard],
    children:[
      // { path: '', redirectTo: 'courses', pathMatch: 'full' }, // Default redirect
      { path: 'user-dashboard', component: UserDashboardComponent }, // 👈 Loads instead of redirecting


      {
        path:'register',
        component:RegisterCoursesComponent,
      }, 

      {
        path:'courses',
        component:CoursesRegisteredComponent,
      }, 

      {
        path:'quizzes',
        component:AvailableQuizzesComponent,
      }, 

      {
        path:':catId',
        component:LoadQuizComponent,
      },
      {
        path:'instructions/:qid',
        component:InstructionsComponent,
      },  
       
    ],
  }
  ,
  {
    path:'start/:qid',
    component:StartComponent,
    // canActivate: [NormalGuard],
  },

 

 

  // {
  //   path:'start-quiz/:qid',
  //   component:StartQuizComponent,
  //   canActivate: [NormalGuard],
  // },
  {
    path:'print_quiz/:qid',
    component:PrintQuizComponent,
    canActivate: [NormalGuard],
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
