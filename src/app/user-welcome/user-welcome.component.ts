import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from "../components/navbar/navbar.component";

@Component({
  selector: 'app-user-welcome',
  templateUrl: './user-welcome.component.html',
  styleUrls: ['./user-welcome.component.css'],
  imports: [NavbarComponent]
})
export class UserWelcomeComponent implements OnInit {
  userName: string | null = ''; // Variable para almacenar el nombre del usuario

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Obtener el nombre del usuario al inicializar el componente
    this.userName = this.authService.getUserName();
  }

  // Método para manejar el cierre de sesión
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
  }
}