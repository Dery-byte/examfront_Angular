import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {HomeComponent } from './pages/home/home.component';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon'; 
import { authInterceptorProviders } from './services/auth.interceptor';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UserDashboardComponent } from './pages/user/user-dashboard/user-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MatListModule } from '@angular/material/list';
import { SidebarComponent } from './pages/admin/sidebar/sidebar.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { ViewCategoriesComponent } from './pages/admin/view-categories/view-categories.component';
import { AddCategoryComponent } from './pages/admin/add-category/add-category.component';
import { ViewQuizzesComponent } from './pages/admin/view-quizzes/view-quizzes.component';
import { AddQuizComponent } from './pages/admin/add-quiz/add-quiz.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
// import { UpdateQuizComponent } from './pages/admin/update-quiz/update-quiz.component';
import { ViewQuizQuestionsComponent } from './pages/admin/view-quiz-questions/view-quiz-questions.component';
import { AddQuestionComponent } from './pages/admin/add-question/add-question.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SidebarComponent as UserSideBar} from "./pages/user/sidebar/sidebar.component";
import { LoadQuizComponent } from './pages/user/load-quiz/load-quiz.component';
import { InstructionsComponent } from './pages/user/instructions/instructions.component';
import { StartComponent } from './pages/user/start/start.component';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { NgxUiLoaderModule, NgxUiLoaderHttpModule} from 'ngx-ui-loader';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatStepperModule} from '@angular/material/stepper';
// import { UpdateCategoryComponent } from './pages/admin/update-category/update-category.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { PrintQuizComponent } from './pages/user/print-quiz/print-quiz.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatTableExporterModule } from 'mat-table-exporter';

// PRIMENG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { RegisterCoursesComponent } from './pages/user/register-courses/register-courses.component';
import { CoursesRegisteredComponent } from './pages/user/courses-registered/courses-registered.component';
import { AvailableQuizzesComponent } from './pages/user/available-quizzes/available-quizzes.component';

//Hnabuger menu staff
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UserLayoutComponent } from './pages/layouts/user-layout/user-layout.component';
import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout.component';
import { UserNavbarComponent } from './pages/user/user-navbar/user-navbar.component';
import { UserSidebarComponent } from './pages/user/user-sidebar/user-sidebar.component';
import { UserfooterComponent } from './pages/user/userfooter/userfooter.component';
import { AdminnavbarComponent } from './pages/admin/adminnavbar/adminnavbar.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminfooterComponent } from './pages/admin/adminfooter/adminfooter.component';







@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    SignupComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    UserDashboardComponent,
    ProfileComponent,
    SidebarComponent,
    WelcomeComponent,
    ViewCategoriesComponent,
    AddCategoryComponent,
    ViewQuizzesComponent,
    AddQuizComponent,
    // UpdateQuizComponent,
    ViewQuizQuestionsComponent,
    AddQuestionComponent,
    UserSideBar,
    LoadQuizComponent,
    InstructionsComponent,
    StartComponent,
    // UpdateCategoryComponent,
    // UpdateCategoryComponent,
    PrintQuizComponent,
    RegisterCoursesComponent,
    CoursesRegisteredComponent,
    AvailableQuizzesComponent,
    UserLayoutComponent,
    AdminLayoutComponent,
    UserNavbarComponent,
    UserSidebarComponent,
    UserfooterComponent,
    AdminnavbarComponent,
    ResetPasswordComponent,
    AdminfooterComponent,
  ],
  imports: [
    BrowserModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    CKEditorModule,
    MatProgressSpinnerModule,
    NgxUiLoaderModule,
    MatMenuModule,
    MatTableModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // MatTableExporterModule ,
    MatTabsModule,
    CanvasJSAngularChartsModule,
    MatTooltipModule,
    MatCheckboxModule,
    NgxPaginationModule,
    // MatTableExporterModule,
     MatDialogModule,
     DialogModule,
     InputTextModule,
    InputTextareaModule,
    ButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatBadgeModule,
    CarouselModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground:true,
    }),
  ],
  providers: [authInterceptorProviders, StartComponent],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
