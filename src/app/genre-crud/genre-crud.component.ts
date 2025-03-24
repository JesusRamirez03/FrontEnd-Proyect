import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { GenreService } from '../services/genre.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null; // Campo para soft delete
}

@Component({
  selector: 'app-genre-crud',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './genre-crud.component.html',
  styleUrls: ['./genre-crud.component.css'],
})
export class GenreCrudComponent implements OnInit, OnDestroy {
  allGenres: Genre[] = []; // Todos los géneros
  activeGenres: Genre[] = []; // Géneros activos
  deletedGenres: Genre[] = []; // Géneros eliminados
  userRole: string | null = '';
  userName: string | null = '';
  private pollingSubscription!: Subscription;

  // Inyección de dependencias con inject()
  private genreService = inject(GenreService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.startPolling(); // Iniciar polling al cargar el componente
  }

  // Iniciar polling para obtener géneros periódicamente
  startPolling(): void {
    const intervalTime = 5000; // Intervalo de 5 segundos
    this.pollingSubscription = this.genreService
      .getGenresWithPolling(intervalTime)
      .subscribe({
        next: (genres) => {
          this.allGenres = genres;
          this.activeGenres = this.allGenres.filter((genre) => !genre.deleted_at);
          this.deletedGenres = this.allGenres.filter((genre) => genre.deleted_at);
        },
        error: (error) => {
          this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
        },
      });
  }

  // Navegar a la página de creación de género
  navigateToCreate(): void {
    this.router.navigate(['/genres/create']);
  }

  // Navegar a la página de edición de género
  navigateToUpdate(id: number): void {
    this.router.navigate([`/genres/edit/${id}`]);
  }

  // Cerrar sesión
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Eliminar un género (soft delete)
  async deleteGenre(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este género?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.genreService.deleteGenre(id));
          this.snackBar.open('Género eliminado', 'Cerrar', { duration: 3000 });
          this.loadGenres(); // Recargar géneros después de eliminar
        } catch (error) {
          this.snackBar.open('Error al eliminar género', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  // Restaurar un género eliminado
  async restoreGenre(id: number): Promise<void> {
    try {
      await lastValueFrom(this.genreService.restoreGenre(id));
      this.snackBar.open('Género restaurado', 'Cerrar', { duration: 3000 });
      this.loadGenres(); // Recargar géneros después de restaurar
    } catch (error) {
      this.snackBar.open('Error al restaurar género', 'Cerrar', { duration: 3000 });
    }
  }

  // Eliminar un género permanentemente
  async forceDeleteGenre(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este género permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.genreService.forceDeleteGenre(id));
          this.snackBar.open('Género eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadGenres(); // Recargar géneros después de eliminar permanentemente
        } catch (error) {
          this.snackBar.open('Error al eliminar género', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  // Cargar géneros manualmente (opcional)
  async loadGenres(): Promise<void> {
    try {
      this.allGenres = await lastValueFrom(this.genreService.getGenres());
      this.activeGenres = this.allGenres.filter((genre) => !genre.deleted_at);
      this.deletedGenres = this.allGenres.filter((genre) => genre.deleted_at);
    } catch (error) {
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  // Detener el polling al destruir el componente
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}