import { Component, inject, OnInit } from '@angular/core';
import { LogService, LogActivity } from '../../services/LogActivityService/log-activity-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-log-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent
  ],
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css'],
})
export class LogActivityComponent implements OnInit {
  logs: LogActivity[] = [];
  filteredLogs: LogActivity[] = [];
  currentUserRole: string | null = '';
  userName: string | null = '';
  selectedFilter: string = 'all';

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

  loadLogs(): void {
    this.logService.getLogs().subscribe({
      next: (logs) => {
        console.log('Logs recibidos:', logs); // Debug
        this.logs = logs;
        this.applyFilter(this.selectedFilter);
      },
      error: (err) => {
        this.snackBar.open('Error al cargar logs', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  applyFilter(filter: string): void {
    this.selectedFilter = filter;
    switch (filter) {
      case 'login':
        this.filteredLogs = this.logs.filter(log => log.action === 'login');
        break;
      case 'store':
        this.filteredLogs = this.logs.filter(log => log.action === 'store');
        break;
      default:
        this.filteredLogs = [...this.logs];
    }
  }

  formatUserData(log: LogActivity): string {
    if (!log.user_data) return 'Usuario no identificado';
    
    if (log.user_data.id) {
      return `${log.user_data.name} (${log.user_data.role})`;
    }
    
    return 'Usuario del sistema';
  }

  formatDate(date: any): string {
    if (!date) return 'Fecha no disponible';
    
    // Caso 1: Fecha viene como objeto MongoDB { $date: string }
    if (date && date.$date) {
      return new Date(date.$date).toLocaleString();
    }
    
    // Caso 2: Fecha viene como string ISO
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? 'Fecha no válida' : parsedDate.toLocaleString();
    }
    
    // Caso 3: Fecha viene como array [año, mes, día, ...] (formato MongoDB alternativo)
    if (Array.isArray(date)) {
      return new Date(date[0], date[1] - 1, date[2]).toLocaleString();
    }
    
    // Caso 4: Fecha viene como timestamp numérico
    if (typeof date === 'number') {
      return new Date(date).toLocaleString();
    }
    
    return 'Formato de fecha no reconocido';
  }
}