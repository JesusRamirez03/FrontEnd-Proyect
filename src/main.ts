import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { WelcomeComponent } from './app/welcome/welcome.component';
import { LoginComponent } from './app/login/login.component';
import { RegisterComponent } from './app/register/register.component';
import { UserWelcomeComponent } from './app/user-welcome/user-welcome.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { GenreCrudComponent } from './app/genre-crud/genre-crud.component';
import { AuthorCrudComponent } from './app/components/author-crud/author-crud.component';
import { StudioCrudComponent } from './app/components/studio-crud/studio-crud.component';
import { MangaCrudComponent } from './app/components/manga-crud/manga-crud.component';
import { AnimeCrudComponent } from './app/components/anime-crud/anime-crud.component';
import { CharacterCrudComponent } from './app/components/character-crud/character-crud.component';
import { AuthorFormComponent } from './app/components/author-crud/author-form/author-form.component';
import { StudioFormComponent } from './app/components/studio-crud/studio-form/studio-form.component';
import { GenreFormComponent } from './app/genre-crud/genre-form/genre-form.component';
import { MangaFormComponent } from './app/components/manga-crud/manga-form/manga-form.component';
import { AnimeFormComponent } from './app/components/anime-crud/anime-form/anime-form.component';
import { CharacterFormComponent } from './app/components/character-crud/character-form/character-form.component';
import { LogActivityComponent } from './app/components/log-activity/log-activity.component';
import { UserAdminComponentComponent } from './app/components/user-admin-component/user-admin-component.component';



const routes: Routes = [
  { path: '', component: WelcomeComponent }, 
  { path: 'login', component: LoginComponent}, 
  { path: 'register', component: RegisterComponent }, 
  { path: 'user-welcome', component: UserWelcomeComponent }, 
  
  { path: 'genre-crud', component: GenreCrudComponent }, 
  {path: 'genres/create', component: GenreFormComponent},
  {path: 'genres/edit/:id', component: GenreFormComponent},

  { path: 'authors', component: AuthorCrudComponent},
  {path: 'authors/create', component: AuthorFormComponent},
  {path: 'authors/edit/:id', component: AuthorFormComponent},
  { path: 'studios', component: StudioCrudComponent},
  {path: 'studios/create', component: StudioFormComponent},
  {path: 'studios/edit/:id', component: StudioFormComponent},

  { path: 'mangas', component: MangaCrudComponent},
  {path: 'mangas/create', component: MangaFormComponent},
  {path: 'mangas/edit/:id', component: MangaFormComponent},

  { path: 'animes', component: AnimeCrudComponent},
  {path: 'animes/create', component: AnimeFormComponent},
  {path: 'animes/edit/:id', component: AnimeFormComponent},

  { path: 'characters', component: CharacterCrudComponent},
  {path: 'characters/create', component: CharacterFormComponent},
  {path: 'characters/edit/:id', component: CharacterFormComponent},

  { path: 'logs', component: LogActivityComponent },

  { path: 'users', component: UserAdminComponentComponent},

  { path: '**', redirectTo: '' } 
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}) .catch((err) => console.error(err));
