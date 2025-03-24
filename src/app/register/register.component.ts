// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Importar FormsModule y NgForm
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule], // Agregar FormsModule aquí
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  password_confirmation: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(form: NgForm) {
    if (form.invalid || this.password !== this.password_confirmation) {
      return; // No enviar el formulario si es inválido
    }

    const user = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        alert('Usuario registrado. Por favor, revisa tu correo para activar tu cuenta.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        alert('Error al registrar. Por favor, intenta de nuevo.');
      }
    });
  }
}