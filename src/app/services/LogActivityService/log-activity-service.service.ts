import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';

export interface LogActivity {
  _id: string; // MongoDB usa _id en lugar de id
  user_id: string;
  action: string;
  description: string;
  created_at?: Date; // Aunque timestamps está false, por si acaso
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}
@Injectable({
  providedIn: 'root',
})
export class LogActivityService {
  private apiUrl = 'http://127.0.0.1:8000/api/logs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllLogs(): Observable<LogActivity[]> {
    return this.http.get<LogActivity[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getLogById(id: string): Observable<LogActivity> {
    return this.http.get<LogActivity>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  async getLogs(): Promise<LogActivity[]> {
    try {
      return await lastValueFrom(this.getAllLogs());
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}