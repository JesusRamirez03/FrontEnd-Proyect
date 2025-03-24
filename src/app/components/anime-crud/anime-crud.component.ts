import { Component, inject, OnInit } from '@angular/core';
import { AnimeService, Anime, Studio, Genre } from '../../services/anime/anime.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-anime-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './anime-crud.component.html',
  styleUrls: ['./anime-crud.component.css'],
})
export class AnimeCrudComponent implements OnInit {
  allAnimes: Anime[] = []; // Todos los animes
  activeAnimes: Anime[] = []; // Animes activos
  deletedAnimes: Anime[] = []; // Animes eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario
  expandedAnimeId: number | null = null; // ID del anime expandido

  studios: Studio[] = []; // Lista de estudios
  genres: Genre[] = []; // Lista de géneros

  // Inyección de dependencias con inject()
  private animeService = inject(AnimeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadAnimes();
    this.loadStudios();
    this.loadGenres();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/animes/create']);
  }

  formatGenres(genres: { id: number; name: string }[]): string {
    return genres.map((genre) => genre.name).join(', ');
  }

  async loadStudios(): Promise<void> {
    try {
      this.studios = await lastValueFrom(this.animeService.getStudios());
    } catch (error) {
      this.snackBar.open('Error al cargar estudios', 'Cerrar', { duration: 3000 });
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.animeService.getGenres());
    } catch (error) {
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  async loadAnimes(): Promise<void> {
    try {
      this.allAnimes = await lastValueFrom(this.animeService.getAnimes());
      this.activeAnimes = this.allAnimes.filter(anime => !anime.deleted_at); // Animes activos
      this.deletedAnimes = this.allAnimes.filter(anime => anime.deleted_at); // Animes eliminados
    } catch (error) {
      this.snackBar.open('Error al cargar animes', 'Cerrar', { duration: 3000 });
    }
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/animes/edit/${id}`]);
  }

  toggleExpand(animeId: number): void {
    this.expandedAnimeId = this.expandedAnimeId === animeId ? null : animeId;
  }

  async deleteAnime(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este anime?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.animeService.deleteAnime(id));
          this.snackBar.open('Anime eliminado', 'Cerrar', { duration: 3000 });
          this.loadAnimes();
        } catch (error) {
          this.snackBar.open('Error al eliminar anime', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async restoreAnime(id: number): Promise<void> {
    try {
      await lastValueFrom(this.animeService.restoreAnime(id));
      this.snackBar.open('Anime restaurado', 'Cerrar', { duration: 3000 });
      this.loadAnimes();
    } catch (error) {
      this.snackBar.open('Error al restaurar anime', 'Cerrar', { duration: 3000 });
    }
  }

  async forceDeleteAnime(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este anime permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.animeService.forceDeleteAnime(id));
          this.snackBar.open('Anime eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadAnimes();
        } catch (error) {
          this.snackBar.open('Error al eliminar anime', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}