import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users'; // Ajusta según tus rutas en Laravel

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en la solicitud';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código ${error.status}: ${error.error.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Extrae la propiedad 'users' del response
        const users = response.users || [];
        console.log('Usuarios extraídos:', users); // Debug
        return users;
      }),
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of([]); // Devuelve array vacío en caso de error
      })
    );
  }
  // Cambiar estado de usuario (activar/desactivar)
  toggleUserStatus(userId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/toggle-status`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Restablecer contraseña
  resetPassword(userId: number, sendEmail: boolean = true): Observable<{ new_password?: string }> {
    return this.http.post<{ new_password?: string }>(
      `${this.apiUrl}/${userId}/reset-password`,
      { send_email: sendEmail },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Cambiar rol
  changeUserRole(userId: number, role: string): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/${userId}/change-role`,
      { role },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}