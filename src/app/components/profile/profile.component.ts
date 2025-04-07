import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {
    name: '',
    email: '',
    role: ''
  };
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.userProfile = response.data;
          this.snackBar.open('Perfil cargado correctamente', 'Cerrar', {
            duration: 3000
          });
        } else {
          this.errorMessage = 'No se pudieron cargar los datos del perfil';
          this.snackBar.open(this.errorMessage, 'Cerrar', {
            duration: 5000
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar el perfil. Intente nuevamente.';
        this.snackBar.open(this.errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Error loading profile:', err);
      }
    });
  }

  navigateToEditName(): void {
    this.router.navigate(['/profile/edit-name']);
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/profile/chance-password']);
  }
}