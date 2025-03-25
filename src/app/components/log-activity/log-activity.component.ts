import { Component, inject, OnInit } from '@angular/core';
import { LogActivityService, LogActivity } from '../../services/LogActivityService/log-activity-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LogDetailDialogComponent } from './log-detail-dialog/log-detail-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field'; // Para mat-label
import { MatInputModule } from '@angular/material/input'; // Necesario cuando usas mat-form-field



@Component({
  selector: 'app-log-activity',
  standalone: true,
  imports: [NavbarComponent,
    CommonModule,
    MatCardModule,    // Módulo para mat-card
    MatTableModule,   // Para mat-table
    MatPaginatorModule, // Para mat-paginator
    MatSortModule,    // Para mat-sort
    MatButtonModule,   // Para mat-button
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css'],
})
export class LogActivityComponent implements OnInit {
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario
  displayedColumns: string[] = ['_id', 'user', 'action', 'description', 'created_at', 'details'];
  dataSource = new MatTableDataSource<LogActivity>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private router = inject(Router);
  private authService = inject(AuthService);
log: any;


  constructor(
    private logService: LogActivityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadLogs();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async loadLogs(): Promise<void> {
    try {
      const logs = await this.logService.getLogs();
      this.dataSource.data = logs;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.snackBar.open('Error al cargar los logs', 'Cerrar', { duration: 3000 });
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewDetails(log: LogActivity): void {
    this.dialog.open(LogDetailDialogComponent, {
      width: '600px',
      data: log
    });
  }

  formatObjectId(id: string): string {
    // Muestra solo los primeros 8 caracteres del ID para ahorrar espacio
    return id.substring(0, 8) + '...';
  }
}