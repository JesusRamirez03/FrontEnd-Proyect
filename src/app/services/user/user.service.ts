import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  async getUsers(): Promise<any[]> {
    const response = await lastValueFrom(
      this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
    );
    return Array.isArray(response) ? response : [];
  }

  async toggleUserStatus(userId: number): Promise<any> {
    return lastValueFrom(
      this.http.put(`${this.apiUrl}/${userId}/toggle-status`, {}, { headers: this.getHeaders() })
    );
  }

  resetUserPassword(userId: number, sendEmail: boolean = true): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/users/${userId}/reset-password`,
      { send_email: sendEmail },
      { headers: this.getHeaders() }
    );
  }

  async changeUserRole(userId: number, role: string): Promise<any> {
    return lastValueFrom(
      this.http.put(
        `${this.apiUrl}/${userId}/change-role`,
        { role },
        { headers: this.getHeaders() }
      )
    );
  }
}