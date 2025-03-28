import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudioService, Studio } from '../../services/studio/studio.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-studio-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './studio-crud.component.html',
  styleUrls: ['./studio-crud.component.css'],
})
export class StudioCrudComponent implements OnInit, OnDestroy {
  allStudios: Studio[] = []; // Todos los estudios
  activeStudios: Studio[] = []; // Estudios activos
  deletedStudios: Studio[] = []; // Estudios eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario
  private studioSubscription!: Subscription;


  constructor(
    private studioService: StudioService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole(); // Obtener el rol del usuario
    this.userName = this.authService.getUserName(); // Obtener el nombre del usuario
    this.loadStudios(); // Cargar los estudios

    console.log('[SSE Component] Iniciando componente y conexión SSE');
    this.studioService.connectToStudioStream();

    this.studioSubscription = this.studioService.getStudioUpdates().subscribe({
      next: (studios) => {
        console.log('[SSE Component] Actualización en tiempo real:', studios);
        this.allStudios = studios;
        this.filterStudios();
      },
      error: (err) => {
        console.error('[SSE Component] Error en el stream SSE:', err);
      },
    });
  }

  ngOnDestroy(): void {
    console.log('[SSE Component] Destruyendo componente, desconectando SSE');
    this.studioSubscription.unsubscribe();
    this.studioService.disconnect();
  }

  private filterStudios(): void {
    console.log('[SSE Component] Filtrando estudios activos/eliminados');
    this.activeStudios = this.allStudios.filter(studio => !studio.deleted_at);
    this.deletedStudios = this.allStudios.filter(studio => studio.deleted_at);
  }

  // Cargar todos los estudios
  async loadStudios(): Promise<void> {
    try {
      this.allStudios = await lastValueFrom(this.studioService.getStudios());
      this.activeStudios = this.allStudios.filter(studio => studio.deleted_at === null); // Estudios activos
      this.deletedStudios = this.allStudios.filter(studio => studio.deleted_at !== null); // Estudios eliminados
    } catch (error) {
      this.snackBar.open('Error al cargar estudios', 'Cerrar', { duration: 3000 });
    }
  }

  // Navegar al formulario de creación
  navigateToCreate(): void {
    this.router.navigate(['/studios/create']);
  }

  // Cerrar sesión
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Métodos para editar, eliminar, restaurar y eliminar permanentemente
  navigateToUpdate(id: number): void {
    this.router.navigate([`/studios/edit/${id}`]);
  }

  async deleteStudio(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este estudio?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.studioService.deleteStudio(id));
          this.snackBar.open('Estudio eliminado', 'Cerrar', { duration: 3000 });
          this.loadStudios(); // Recargar la lista
        } catch (error) {
          this.snackBar.open('Error al eliminar estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async restoreStudio(id: number): Promise<void> {
    try {
      await lastValueFrom(this.studioService.restoreStudio(id));
      this.snackBar.open('Estudio restaurado', 'Cerrar', { duration: 3000 });
      this.loadStudios(); // Recargar la lista
    } catch (error) {
      this.snackBar.open('Error al restaurar estudio', 'Cerrar', { duration: 3000 });
    }
  }

  async forceDeleteStudio(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este estudio permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.studioService.forceDeleteStudio(id));
          this.snackBar.open('Estudio eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadStudios(); // Recargar la lista
        } catch (error) {
          this.snackBar.open('Error al eliminar estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}