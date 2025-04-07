import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword && confirmPassword && newPassword !== confirmPassword 
      ? { mismatch: true } 
      : null;
  }

  get f() {
    return this.passwordForm.controls;
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    this.profileService.updatePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada correctamente. Serás redirigido para iniciar sesión.', 'Cerrar', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        let errorMessage = 'Error al actualizar la contraseña';
        
        if (err.status === 400 || err.status === 422) {
          errorMessage = err.error?.message || 
                        err.error?.errors?.new_password?.[0] || 
                        err.error?.errors?.current_password?.[0] || 
                        errorMessage;
        } else if (err.status === 401) {
          errorMessage = 'La contraseña actual es incorrecta';
        }

        this.snackBar.open(errorMessage, 'Cerrar', { 
          duration: 7000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}

