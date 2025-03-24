// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) {
      return; // No enviar el formulario si es inválido
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
        this.router.navigate(['/user-welcome']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        alert('Credenciales inválidas. Por favor, intenta de nuevo.');
      }
    });
  }
}