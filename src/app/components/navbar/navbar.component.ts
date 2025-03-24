import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() userName: string | null = ''; // Recibe el nombre del usuario desde el componente padre
  @Output() logoutEvent = new EventEmitter<void>(); // Emite un evento cuando el usuario cierra sesión

  // Método para manejar el cierre de sesión
  onLogout(): void {
    this.logoutEvent.emit(); // Emite el evento de cierre de sesión
  }
}