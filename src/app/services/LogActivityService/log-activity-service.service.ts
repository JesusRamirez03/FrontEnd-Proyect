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

export interface LogsResponse {
  logs: LogActivity[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://127.0.0.1:8000/api/logs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getLogs(page: number = 1, perPage: number = 10): Observable<LogsResponse> {
    const params = {
      page: page.toString(),
      per_page: perPage.toString()
    };
    
    return this.http.get<LogsResponse>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: params 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener logs:', error);
        return of({
          logs: [],
          pagination: {
            total: 0,
            per_page: perPage,
            current_page: page,
            last_page: 1
          }
        });
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