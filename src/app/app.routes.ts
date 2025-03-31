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
import { UserAdminComponentComponent } from './components/user-admin-component/user-admin-component.component';
import { LogActivityComponent } from './components/log-activity/log-activity.component';
import { noAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'user-welcome', component: UserWelcomeComponent, canActivate: [authGuard] },
  
  // Rutas CRUD con protección de autenticación
  { path: 'genre-crud', component: GenreCrudComponent, canActivate: [authGuard] },
  { path: 'genres/create', component: GenreFormComponent, canActivate: [authGuard] },
  { path: 'genres/edit/:id', component: GenreFormComponent, canActivate: [authGuard]},

  { path: 'authors', component: AuthorCrudComponent, canActivate: [authGuard]},
  { path: 'authors/create', component: AuthorFormComponent, canActivate: [authGuard]},
  { path: 'authors/edit/:id', component: AuthorFormComponent, canActivate: [authGuard] },

  { path: 'studios', component: StudioCrudComponent, canActivate: [authGuard] },
  { path: 'studios/create', component: StudioFormComponent, canActivate: [authGuard] },
  { path: 'studios/edit/:id', component: StudioFormComponent, canActivate: [authGuard] },

  { path: 'mangas', component: MangaCrudComponent, canActivate: [authGuard]},
  { path: 'mangas/create', component: MangaFormComponent, canActivate: [authGuard] },
  { path: 'mangas/edit/:id', component: MangaFormComponent, canActivate: [authGuard] },

  { path: 'animes', component: AnimeCrudComponent, canActivate: [authGuard] },
  { path: 'animes/create', component: AnimeFormComponent, canActivate: [authGuard] },
  { path: 'animes/edit/:id', component: AnimeFormComponent, canActivate: [authGuard] },

  { path: 'characters', component: CharacterCrudComponent, canActivate: [authGuard] },
  { path: 'characters/create', component: CharacterFormComponent, canActivate: [authGuard] },
  { path: 'characters/edit/:id', component: CharacterFormComponent, canActivate: [authGuard] },

  // Rutas de admin con protección adicional
  { path: 'logs', component: LogActivityComponent, canActivate: [adminGuard] },
  { path: 'users', component: UserAdminComponentComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' } // Ruta comodín para 404
];