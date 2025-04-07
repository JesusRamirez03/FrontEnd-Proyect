import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/profile';

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body) {
          return response.body;
        }
        throw new Error('Respuesta vacía del servidor');
      }),
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  updateName(name: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/name`, { name }, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => response.body),
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

// profile.service.ts (AJUSTADO)
updatePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/password`, {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: confirmPassword // Añadir este campo
  }, { headers: this.getHeaders() });
}

  private handleError(error: any): void {
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}