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
import { UpdateQuizComponent } from './pages/admin/update-quiz/update-quiz.component';
import { ViewQuizQuestionsComponent } from './pages/admin/view-quiz-questions/view-quiz-questions.component';
import { AddQuestionComponent } from './pages/admin/add-question/add-question.component';
import { LoadQuizComponent } from './pages/user/load-quiz/load-quiz.component';
import { InstructionsComponent } from './pages/user/instructions/instructions.component';
import { StartComponent } from './pages/user/start/start.component';
import { UpdateCategoryComponent } from './pages/admin/update-category/update-category.component';
import { PrintQuizComponent } from './pages/user/print-quiz/print-quiz.component';
import { UpdateQuestionComponent } from './pages/admin/update-question/update-question.component';
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
      {
        path:'update-category/:cid',
        component:UpdateCategoryComponent,
      },
       {
        path:'quizzes',
        component:ViewQuizzesComponent,
      },  {
        path:'add-quiz',
        component:AddQuizComponent,
      },
      {
        path:'update-quiz/:qid',
        component:UpdateQuizComponent,
      },
      {
        path:'view-quetions/:qId/:qTitle',
        component:ViewQuizQuestionsComponent,
      },
      {
        path:'add-question/:qId/:title',
        component:AddQuestionComponent,
      },
      {
        path:'update-question/:quesId',
        component:UpdateQuestionComponent,
      },
    ]
  },
  {
    path:'user-dashboard',
    component:UserDashboardComponent,
    canActivate: [NormalGuard],
    children:[
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
    canActivate: [NormalGuard],
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
