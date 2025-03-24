import { Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserWelcomeComponent } from './user-welcome/user-welcome.component';
import { GenreCrudComponent } from './genre-crud/genre-crud.component';
import { AuthorCrudComponent } from './components/author-crud/author-crud.component';
import { StudioCrudComponent } from './components/studio-crud/studio-crud.component';
import { MangaCrudComponent } from './components/manga-crud/manga-crud.component';
import { AnimeCrudComponent } from './components/anime-crud/anime-crud.component';
import { CharacterCrudComponent } from './components/character-crud/character-crud.component';
import { GenreFormComponent } from './genre-crud/genre-form/genre-form.component';
import { AuthorFormComponent } from './components/author-crud/author-form/author-form.component';
import { StudioFormComponent } from './components/studio-crud/studio-form/studio-form.component';
import { MangaFormComponent } from './components/manga-crud/manga-form/manga-form.component';
import { AnimeFormComponent } from './components/anime-crud/anime-form/anime-form.component';
import { CharacterFormComponent } from './components/character-crud/character-form/character-form.component';

export const routes: Routes = [
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

  { path: '**', redirectTo: '' } 
];
