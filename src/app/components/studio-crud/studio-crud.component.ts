import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-studio-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTabsModule],
  templateUrl: './studio-crud.component.html',
  styleUrls: ['./studio-crud.component.css'],
})
export class StudioCrudComponent implements OnInit {
  allStudios: Studio[] = []; // Todos los estudios
  activeStudios: Studio[] = []; // Estudios activos
  deletedStudios: Studio[] = []; // Estudios eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  loading: boolean = true;

  private sseUrl = 'http://127.0.0.1:8000/api/studios/stream'
  private eventSource: EventSource | null = null
  private zone = inject(NgZone)
  private reconnectTimeoutId: any

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
    this.stream();

      // Suscribirse a cambios en el servicio
    this.studioService.studios$.subscribe(studios => {
      this.allStudios = studios;
      this.updateFilteredStudios();
  });
  }
  private updateFilteredStudios(): void {
    this.activeStudios = this.allStudios.filter(studio => studio.deleted_at === null);
    this.deletedStudios = this.allStudios.filter(studio => studio.deleted_at !== null);
  }


  private stream(): void {
    this.zone.runOutsideAngular(() => {
      this.disconnect();
  
      this.eventSource = new EventSource(this.sseUrl);
  
      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            // Forzar la actualización de los estudios
            this.loadStudios(); // <-- Cambiar esto
            console.log('Evento SSE recibido, actualizando datos...');
          } catch (error) {
            console.error('SSE - Error al procesar datos:', error);
          }
        });
      };
  
      this.eventSource.onerror = (error) => {
        console.error('Error en conexión SSE:', error);
        this.disconnect();
        this.reconnectTimeoutId = setTimeout(() => this.stream(), 5000);
      };
    });
  }

  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }
  }

  reconnect(): void {
    this.stream()
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  // Cargar todos los estudios
  async loadStudios(): Promise<void> {
    this.loading = true;
    try {
      const response = await lastValueFrom(this.studioService.getStudios(this.currentPage, this.itemsPerPage));
      this.allStudios = response.studios;
      this.activeStudios = this.allStudios.filter(s => !s.deleted_at);
      this.deletedStudios = this.allStudios.filter(s => s.deleted_at);
      this.totalItems = response.pagination.total;
      this.totalPages = response.pagination.last_page;
    } catch (error) {
      this.snackBar.open('Error al cargar estudios', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudios();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadStudios();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadStudios();
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