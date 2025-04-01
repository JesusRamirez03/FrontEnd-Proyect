import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthorService, Author } from '../../services/author/author.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EchoService } from '../../services/echo/echo.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-author-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTabsModule],
  templateUrl: './author-crud.component.html',
  styleUrls: ['./author-crud.component.css'],
})
export class AuthorCrudComponent implements OnInit, OnDestroy {
  allAuthors: Author[] = []; // Todos los autores
  activeAuthors: Author[] = []; // Autores activos
  deletedAuthors: Author[] = []; // Autores eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  loading: boolean = true;
  
  constructor(
    private authorService: AuthorService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private echoService: EchoService // Inyecta el servicio EchoService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadAuthors();
  
    // Suscripción al evento con logs
    this.echoService.listen('authors', '.author.events', (data: any) => {
      console.log('Evento "author.events" recibido en el componente:', data);
      this.loadAuthors(); // Recargar autores
    });
  }
  
  ngOnDestroy() {
    this.echoService.leave('authors');
    console.log('Componente destruido, canal "authors" abandonado');
  }



  // Cargar todos los autores
  async loadAuthors(): Promise<void> {
    this.loading = true;
    try {
      const response = await lastValueFrom(this.authorService.getAuthors(this.currentPage, this.itemsPerPage));
      this.allAuthors = response.authors;
      this.activeAuthors = this.allAuthors.filter(a => !a.deleted_at);
      this.deletedAuthors = this.allAuthors.filter(a => a.deleted_at);
      this.totalItems = response.pagination.total;
      this.totalPages = response.pagination.last_page;
    } catch (error) {
      this.snackBar.open('Error al cargar autores', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAuthors();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAuthors();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAuthors();
    }
  }

  // Navegar al formulario de creación
  navigateToCreate(): void {
    this.router.navigate(['/authors/create']);
  }

  // Cerrar sesión
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Métodos para editar, eliminar, restaurar y eliminar permanentemente
  navigateToUpdate(id: number): void {
    this.router.navigate([`/authors/edit/${id}`]);
  }

  async deleteAuthor(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este autor?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.authorService.deleteAuthor(id));
          this.snackBar.open('Autor eliminado', 'Cerrar', { duration: 3000 });
          this.loadAuthors(); // Recargar la lista
        } catch (error) {
          this.snackBar.open('Error al eliminar autor', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async restoreAuthor(id: number): Promise<void> {
    try {
      await lastValueFrom(this.authorService.restoreAuthor(id));
      this.snackBar.open('Autor restaurado', 'Cerrar', { duration: 3000 });
      this.loadAuthors(); // Recargar la lista
    } catch (error) {
      this.snackBar.open('Error al restaurar autor', 'Cerrar', { duration: 3000 });
    }
  }

  async forceDeleteAuthor(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este autor permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.authorService.forceDeleteAuthor(id));
          this.snackBar.open('Autor eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadAuthors(); // Recargar la lista
        } catch (error) {
          this.snackBar.open('Error al eliminar autor', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}