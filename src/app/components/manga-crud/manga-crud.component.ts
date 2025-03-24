import { Component, inject, OnInit } from '@angular/core';
import { MangaService, Manga, Author, Genre } from '../../services/manga/manga.service';
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
  selector: 'app-manga-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './manga-crud.component.html',
  styleUrls: ['./manga-crud.component.css'],
})
export class MangaCrudComponent implements OnInit {
  allMangas: Manga[] = []; // Todos los mangas
  activeMangas: Manga[] = []; // Mangas activos
  deletedMangas: Manga[] = []; // Mangas eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario
  expandedMangaId: number | null = null; // ID del manga expandido

  authors: Author[] = []; // Lista de autores
  genres: Genre[] = []; // Lista de géneros

  // Inyección de dependencias con inject()
  private mangaService = inject(MangaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadMangas();
    this.loadAuthors();
    this.loadGenres();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/mangas/create']);
  }

  formatGenres(genres: { id: number; name: string }[]): string {
    return genres.map((genre) => genre.name).join(', ');
  }

  async loadAuthors(): Promise<void> {
    try {
      this.authors = await lastValueFrom(this.mangaService.getAuthors());
    } catch (error) {
      this.snackBar.open('Error al cargar autores', 'Cerrar', { duration: 3000 });
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.mangaService.getGenres());
    } catch (error) {
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  async loadMangas(): Promise<void> {
    try {
      this.allMangas = await lastValueFrom(this.mangaService.getMangas());
      this.activeMangas = this.allMangas.filter(manga => !manga.deleted_at); // Mangas activos
      this.deletedMangas = this.allMangas.filter(manga => manga.deleted_at); // Mangas eliminados
    } catch (error) {
      this.snackBar.open('Error al cargar mangas', 'Cerrar', { duration: 3000 });
    }
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/mangas/edit/${id}`]);
  }

  toggleExpand(mangaId: number): void {
    this.expandedMangaId = this.expandedMangaId === mangaId ? null : mangaId;
  }

  async deleteManga(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este manga?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.mangaService.deleteManga(id));
          this.snackBar.open('Manga eliminado', 'Cerrar', { duration: 3000 });
          this.loadMangas();
        } catch (error) {
          this.snackBar.open('Error al eliminar manga', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async restoreManga(id: number): Promise<void> {
    try {
      await lastValueFrom(this.mangaService.restoreManga(id));
      this.snackBar.open('Manga restaurado', 'Cerrar', { duration: 3000 });
      this.loadMangas();
    } catch (error) {
      this.snackBar.open('Error al restaurar manga', 'Cerrar', { duration: 3000 });
    }
  }

  async forceDeleteManga(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este manga permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.mangaService.forceDeleteManga(id));
          this.snackBar.open('Manga eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadMangas();
        } catch (error) {
          this.snackBar.open('Error al eliminar manga', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}