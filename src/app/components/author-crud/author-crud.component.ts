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

@Component({
  selector: 'app-author-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './author-crud.component.html',
  styleUrls: ['./author-crud.component.css'],
})
export class AuthorCrudComponent implements OnInit, OnDestroy {
  allAuthors: Author[] = []; // Todos los autores
  activeAuthors: Author[] = []; // Autores activos
  deletedAuthors: Author[] = []; // Autores eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario
  


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
    try {
      this.allAuthors = await lastValueFrom(this.authorService.getAuthors());
      this.activeAuthors = this.allAuthors.filter(author => !author.deleted_at);
      this.deletedAuthors = this.allAuthors.filter(author => author.deleted_at);
    } catch (error) {
      console.error('Error al cargar autores:', error);
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