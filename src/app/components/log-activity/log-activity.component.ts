import { Component, OnInit } from '@angular/core';
import { LogActivity, LogActivityService,} from '../../services/LogActivityService/log-activity-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-log-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, NavbarComponent],
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css'],
})
export class LogActivityComponent implements OnInit {
  logs: LogActivity[] = []; // Todos los logs
  userName: string | null = ''; // Nombre del usuario
  userRole: string | null = ''; // Rol del usuario


  constructor(
    private logActivityService: LogActivityService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService

  ) {}

  ngOnInit(): void {
  }

    // Cerrar sesión
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Cargar todos los logs

}