import { Component, inject, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

@Component({
  selector: 'app-user-admin-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    NavbarComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-admin-component.component.html',
  styleUrls: ['./user-admin-component.component.css']
})
export class UserAdminComponentComponent implements OnInit {
  allUsers: User[] = [];
  activeUsers: User[] = [];
  inactiveUsers: User[] = [];
  currentUserRole: string | null = '';
  userName: string | null = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  loading: boolean = false; // Nueva propiedad para controlar carga

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true; // Activar spinner
    
    this.userService.getUsers(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.allUsers = response.users;
        this.activeUsers = response.users.filter(user => user.is_active);
        this.inactiveUsers = response.users.filter(user => !user.is_active);
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.last_page;
        this.loading = false; // Desactivar spinner
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loading = false; // Desactivar spinner incluso en error
      }
    });
  }
  // Métodos para cambiar página
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        this.loadUsers(); // Recargar lista completa
        this.snackBar.open(`Usuario ${updatedUser.is_active ? 'activado' : 'desactivado'}`, 'Cerrar', { duration: 3000 });
      },
      error: (err) => this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 })
    });
  }

  resetPassword(userId: number, sendEmail: boolean = true): void {
    this.userService.resetPassword(userId, sendEmail).subscribe({
      next: (response) => {
        const message = sendEmail 
          ? 'Contraseña restablecida (enviada por correo)' 
          : `Contraseña restablecida: ${response.new_password}`;
        this.snackBar.open(message, 'Cerrar', { duration: 5000 });
      },
      error: (err) => this.snackBar.open('Error al restablecer contraseña', 'Cerrar', { duration: 3000 })
    });
  }

  changeRole(user: User, newRole: string): void {
    if (user.id === this.authService.getUserId()) {
      this.snackBar.open('No puedes cambiar tu propio rol', 'Cerrar', { duration: 3000 });
      return;
    }

    this.userService.changeUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        this.loadUsers();
        this.snackBar.open('Rol actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => this.snackBar.open('Error al cambiar rol', 'Cerrar', { duration: 3000 })
    });
  }
}