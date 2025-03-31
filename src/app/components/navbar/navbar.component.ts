import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() userName: string | null = ''; // Recibe el nombre del usuario desde el componente padre
  @Output() logoutEvent = new EventEmitter<void>(); // Emite un evento cuando el usuario cierra sesión

  constructor(private authService: AuthService) {} // Inyecta AuthService

  // Método para verificar si el usuario es admin
  isAdmin(): boolean {
    return this.authService.isAdmin(); // Usa el método que ya existe en AuthService
  }
  onLogout(): void {
    this.logoutEvent.emit(); // Emite el evento de cierre de sesión
  }
}