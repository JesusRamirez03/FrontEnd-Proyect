import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-user-admin-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule
  ],
  templateUrl: './user-admin-component.component.html',
  styleUrls: ['./user-admin-component.component.css']
})
export class UserAdminComponentComponent implements OnInit {
  allUsers: User[] = [];
  activeUsers: User[] = [];
  inactiveUsers: User[] = [];
  currentUserId: number | null = null;
  expandedUserId: number | null = null;
  isLoading = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.getUserId();
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading = true;
    try {
      this.allUsers = await this.userService.getUsers();
      this.activeUsers = this.allUsers.filter(user => user.is_active);
      this.inactiveUsers = this.allUsers.filter(user => !user.is_active);
    } catch (error) {
      console.error('Error loading users:', error);
      this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      this.allUsers = [];
      this.activeUsers = [];
      this.inactiveUsers = [];
    } finally {
      this.isLoading = false;
    }
  }

  toggleExpand(userId: number): void {
    // Si ya está expandido, lo contraemos; si no, lo expandimos
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }

  async toggleUserStatus(userId: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        message: `¿Estás seguro de querer ${this.getUserById(userId)?.is_active ? 'desactivar' : 'activar'} este usuario?` 
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.userService.toggleUserStatus(userId);
          this.snackBar.open('Estado del usuario actualizado', 'Cerrar', { duration: 3000 });
          await this.loadUsers();
        } catch (error) {
          this.snackBar.open('Error al actualizar estado', 'Cerrar', { duration: 3000 });
          console.error(error);
        }
      }
    });
  }

  async resetUserPassword(userId: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Restablecer contraseña de este usuario?' }
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const response = await lastValueFrom(
            this.userService.resetUserPassword(userId, true)
          );
          
          console.log('Respuesta del servidor:', response);
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          
        } catch (error) {
          console.error('Error en reset password:', error);
          this.snackBar.open('Error al restablecer contraseña', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async changeUserRole(userId: number, newRole: string): Promise<void> {
    if (userId === this.currentUserId) {
      this.snackBar.open('No puedes cambiar tu propio rol', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `¿Cambiar rol a "${newRole}"?` },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.userService.changeUserRole(userId, newRole);
          this.snackBar.open('Rol actualizado', 'Cerrar', { duration: 3000 });
          await this.loadUsers();
        } catch (error) {
          this.snackBar.open('Error al cambiar rol', 'Cerrar', { duration: 3000 });
          console.error(error);
        }
      }
    });
  }

  private getUserById(id: number): User | undefined {
    return this.allUsers.find(user => user.id === id);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'primary';
      case 'user': return 'accent';
      default: return 'warn';
    }
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'cancel';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }
}