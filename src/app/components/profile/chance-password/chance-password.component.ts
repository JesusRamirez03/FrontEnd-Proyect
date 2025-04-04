import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile/profile.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chance-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './chance-password.component.html',
  styleUrl: './chance-password.component.css'
})
export class ChancePasswordComponent {
  passwordForm: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.profileService.updatePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error al actualizar la contraseña', 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
