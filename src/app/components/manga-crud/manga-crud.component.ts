import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MangaService, Manga, Author, Genre } from '../../services/manga/manga.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-manga-crud',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './manga-crud.component.html',
  styleUrls: ['./manga-crud.component.css'],
})
export class MangaCrudComponent implements OnInit, OnDestroy {
  allMangas: Manga[] = [];
  activeMangas: Manga[] = [];
  deletedMangas: Manga[] = [];
  authors: Author[] = [];
  genres: Genre[] = [];
  userRole: string | null = '';
  userName: string | null = '';
  expandedMangaId: number | null = null;
  loading: boolean = true;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Inyección de dependencias
  private mangaService = inject(MangaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadAllData();
  }

  async loadAllData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadMangas(),
        this.loadAuthors(),
        this.loadGenres()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.snackBar.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async loadMangas(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.mangaService.getMangasPaginated(this.currentPage, this.itemsPerPage)
      );
      this.allMangas = response.mangas;
      this.activeMangas = this.allMangas.filter(manga => !manga.deleted_at);
      this.deletedMangas = this.allMangas.filter(manga => manga.deleted_at);
      this.totalItems = response.pagination.total;
      this.totalPages = response.pagination.last_page;
    } catch (error) {
      this.snackBar.open('Error al cargar mangas', 'Cerrar', { duration: 3000 });
    }
  }

  async loadAuthors(): Promise<void> {
    try {
      this.authors = await lastValueFrom(this.mangaService.getAuthors());
    } catch (error) {
      console.error('Error loading authors:', error);
      this.snackBar.open('Error al cargar autores', 'Cerrar', { duration: 3000 });
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.mangaService.getGenres());
    } catch (error) {
      console.error('Error loading genres:', error);
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadMangas();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMangas();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMangas();
    }
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMangas();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/mangas/create']);
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/mangas/edit/${id}`]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleExpand(mangaId: number): void {
    this.expandedMangaId = this.expandedMangaId === mangaId ? null : mangaId;
  }

  formatGenres(genres: { id: number; name: string }[]): string {
    return genres.map(genre => genre.name).join(', ');
  }

  getAuthorName(authorId: number): string {
    const author = this.authors.find(a => a.id === authorId);
    return author ? author.name : 'Autor desconocido';
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

  ngOnDestroy(): void {
    // Limpieza si es necesaria
  }
}