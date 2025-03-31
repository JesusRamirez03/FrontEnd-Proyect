import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // URL de tu API Laravel

  constructor(private http: HttpClient, private router: Router) {}

  // Registrar un usuario
  register(user: any): Observable<any> {
    console.log('Datos enviados:', user); // Verifica que los datos sean correctos
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap({
        next: (response) => console.log('Respuesta del backend:', response),
        error: (err) => console.error('Error en la petición:', err)
      })
    );
  }

  // Iniciar sesión
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userId', response.user.id);
      }),
      catchError((error) => {
        return throwError(() => error); 
      })
    );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole'); // Eliminar el rol al cerrar sesión
    this.router.navigate(['/login']); // Redirigir al login
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener el nombre del usuario
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  // Obtener el rol del usuario
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }
    // Método para verificar si el usuario actual es admin
    isAdmin(): boolean {
      return this.getUserRole() === 'admin';
    }

  
}