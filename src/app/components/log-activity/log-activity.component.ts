import { Component, inject, OnInit } from '@angular/core';
import { LogService, LogActivity, LogsResponse } from '../../services/LogActivityService/log-activity-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css'],
})
export class LogActivityComponent implements OnInit {
  logs: LogActivity[] = [];
  currentUserRole: string | null = '';
  userName: string | null = '';
  loading = false;

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;

  private router = inject(Router);

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadLogs();
  }

  // En tu LogActivityComponent
min(a: number, b: number): number {
  return Math.min(a, b);
}

  loadLogs(): void {
    this.loading = true;
    this.logService.getLogs(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.last_page;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar logs', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  onItemsPerPageChange(perPage: number): void {
    this.itemsPerPage = perPage;
    this.currentPage = 1; // Reset to first page
    this.loadLogs();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatUserData(log: LogActivity): string {
    if (!log.user_data) return 'Usuario no identificado';
    return log.user_data.name || log.user_data.email || 'Usuario del sistema';
  }

  formatDate(date: any): string {
    if (!date) return 'Fecha no disponible';
    
    if (date && date.$date) {
      return new Date(date.$date).toLocaleString();
    }
    
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleString();
    }
    
    return 'Fecha no reconocida';
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'login': 'login',
      'store': 'add_shopping_cart',
      'update': 'edit',
      'delete': 'delete'
    };
    return icons[action] || 'info';
  }
}