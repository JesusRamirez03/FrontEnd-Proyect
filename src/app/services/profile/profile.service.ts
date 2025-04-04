import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
      'Content-Type': 'application/json'
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  updateName(name: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/name`, { name }, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, {
      current_password: currentPassword,
      new_password: newPassword
    }, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: any): void {
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}