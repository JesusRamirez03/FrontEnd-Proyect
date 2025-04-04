import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  password_confirmation: string = '';
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(form: NgForm) {
    if (form.invalid || this.password !== this.password_confirmation) {
      return;
    }

    this.isLoading = true;

    const user = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        this.isLoading = false;
        this.router.navigate(['/login'], {
          state: { message: 'Usuario registrado. Por favor, revisa tu correo para activar tu cuenta.' }
        });
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        this.isLoading = false;
        // Aquí podrías mostrar un snackbar en lugar de un alert
        alert('Error al registrar. Por favor, intenta de nuevo.');
      }
    });
  }
}