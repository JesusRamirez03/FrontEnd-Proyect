import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../auth.service';

export interface LogActivity {
  _id: string;
  user_id: number | null;
  action: string;
  description: string;
  created_at?: any;
  user_data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://127.0.0.1:8000/api/logs'; // Ajusta la URL según tu API

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getLogs(): Observable<LogActivity[]> {
    return this.http.get<LogActivity[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('Respuesta completa de logs:', response); // Debug
        return Array.isArray(response) ? response : [];
      }),
      catchError(error => {
        console.error('Error al obtener logs:', error);
        return of([]);
      })
    );
  }

  getLogById(id: string): Observable<LogActivity | null> {
    return this.http.get<LogActivity>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener log:', error);
        return of(null);
      })
    );
  }
}