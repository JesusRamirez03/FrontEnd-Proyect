import { Component, OnInit, inject } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

interface PaginatedAnimeResponse {
  animes: Anime[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Component({
  selector: 'app-anime-crud',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './anime-crud.component.html',
  styleUrls: ['./anime-crud.component.css']
})
export class AnimeCrudComponent implements OnInit {
  // Datos
  activeAnimes: Anime[] = [];
  deletedAnimes: Anime[] = [];
  studios: Studio[] = [];
  genres: Genre[] = [];
  
  // Paginación
  activePage = 1;
  activePerPage = 10;
  totalActiveItems = 0;
  
  deletedPage = 1;
  deletedPerPage = 10;
  totalDeletedItems = 0;
  
  // UI
  userRole: string | null = '';
  userName: string | null = '';
  expandedAnimeId: number | null = null;
  loading = true;
  activeTabIndex = 0;

  public Math = Math;

  // Inyección de servicios
  private animeService = inject(AnimeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    await this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadStudios(),
        this.loadGenres(),
        this.loadActiveAnimes(),
        this.userRole === 'admin' ? this.loadDeletedAnimes() : Promise.resolve()
      ]);
    } catch (error) {
      this.showError('Error al cargar datos iniciales');
    } finally {
      this.loading = false;
    }
  }

  async loadActiveAnimes(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.animeService.getAnimesPaginated(this.activePage, this.activePerPage, false)
      );
      this.activeAnimes = response.animes;
      this.totalActiveItems = response.pagination.total;
    } catch (error) {
      this.showError('Error al cargar animes activos');
    }
  }

  async loadDeletedAnimes(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.animeService.getAnimesPaginated(this.deletedPage, this.deletedPerPage, true)
      );
      this.deletedAnimes = response.animes;
      this.totalDeletedItems = response.pagination.total;
    } catch (error) {
      this.showError('Error al cargar animes eliminados');
    }
  }

  async loadStudios(): Promise<void> {
    try {
      this.studios = await lastValueFrom(this.animeService.getStudios());
    } catch (error) {
      this.showError('Error al cargar estudios');
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.animeService.getGenres());
    } catch (error) {
      this.showError('Error al cargar géneros');
    }
  }

  onActivePageChange(event: PageEvent): void {
    this.activePage = event.pageIndex + 1;
    this.activePerPage = event.pageSize;
    this.loadActiveAnimes();
  }

  onDeletedPageChange(event: PageEvent): void {
    this.deletedPage = event.pageIndex + 1;
    this.deletedPerPage = event.pageSize;
    this.loadDeletedAnimes();
  }

  navigateToCreate(): void {
    this.router.navigate(['/animes/create']);
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/animes/edit/${id}`]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleExpand(animeId: number): void {
    this.expandedAnimeId = this.expandedAnimeId === animeId ? null : animeId;
  }

  formatGenres(genres: Genre[]): string {
    return genres?.map(genre => genre.name).join(', ') || 'Sin géneros';
  }

  getStudioName(studioId: number): string {
    const studio = this.studios.find(s => s.id === studioId);
    return studio?.name || 'Estudio desconocido';
  }

  async deleteAnime(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de eliminar este anime?' 
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.animeService.deleteAnime(id));
          this.showSuccess('Anime eliminado correctamente');
          this.loadActiveAnimes();
          // Si estamos en la pestaña de eliminados, recargar también
          if (this.activeTabIndex === 1) {
            this.loadDeletedAnimes();
          }
        } catch (error) {
          this.showError('Error al eliminar el anime');
        }
      }
    });
  }

  async restoreAnime(id: number): Promise<void> {
    try {
      await lastValueFrom(this.animeService.restoreAnime(id));
      this.showSuccess('Anime restaurado correctamente');
      this.loadDeletedAnimes();
      // Recargar también los activos
      this.loadActiveAnimes();
    } catch (error) {
      this.showError('Error al restaurar el anime');
    }
  }

  async forceDeleteAnime(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Confirmar eliminación permanente',
        message: '¿Estás seguro de eliminar este anime permanentemente? Esta acción no se puede deshacer.' 
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.animeService.forceDeleteAnime(id));
          this.showSuccess('Anime eliminado permanentemente');
          this.loadDeletedAnimes();
        } catch (error) {
          this.showError('Error al eliminar el anime');
        }
      }
    });
  }

  goToFirstPage(type: 'active' | 'deleted'): void {
    if (type === 'active') {
      this.activePage = 1;
      this.loadActiveAnimes();
    } else {
      this.deletedPage = 1;
      this.loadDeletedAnimes();
    }
  }
  
  goToLastPage(type: 'active' | 'deleted'): void {
    if (type === 'active') {
      this.activePage = Math.ceil(this.totalActiveItems / this.activePerPage);
      this.loadActiveAnimes();
    } else {
      this.deletedPage = Math.ceil(this.totalDeletedItems / this.deletedPerPage);
      this.loadDeletedAnimes();
    }
  }
  
  prevPage(type: 'active' | 'deleted'): void {
    if (type === 'active' && this.activePage > 1) {
      this.activePage--;
      this.loadActiveAnimes();
    } else if (type === 'deleted' && this.deletedPage > 1) {
      this.deletedPage--;
      this.loadDeletedAnimes();
    }
  }
  
  nextPage(type: 'active' | 'deleted'): void {
    if (type === 'active' && this.activePage < Math.ceil(this.totalActiveItems / this.activePerPage)) {
      this.activePage++;
      this.loadActiveAnimes();
    } else if (type === 'deleted' && this.deletedPage < Math.ceil(this.totalDeletedItems / this.deletedPerPage)) {
      this.deletedPage++;
      this.loadDeletedAnimes();
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}