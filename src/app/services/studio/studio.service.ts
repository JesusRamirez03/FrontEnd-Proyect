import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Studio {
  id: number;
  name: string;
  deleted_at?: string | null; // Para manejar soft delete
}

export interface PaginatedStudios {
  studios: Studio[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class StudioService {
  private apiUrl = 'http://127.0.0.1:8000/api/studios'; // URL de la API de estudios


  constructor(private http: HttpClient, private authService: AuthService, private zone: NgZone) { }

  private studiosSubject = new BehaviorSubject<Studio[]>([]);
  studios$ = this.studiosSubject.asObservable();

  // Método para construir las cabeceras HTTP con el token de autenticación
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No se encontró el token de autenticación.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }


  // Manejo de errores HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error en la solicitud.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Obtener todos los estudios (incluyendo eliminados)
  getStudios(page: number = 1, perPage: number = 10): Observable<PaginatedStudios> {
    const params = { 
      page: page.toString(), 
      per_page: perPage.toString() 
    };
    
    return this.http.get<PaginatedStudios>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: params 
    }).pipe(
      tap(response => this.studiosSubject.next(response.studios)),
      catchError(this.handleError)
    );
  }

  // Obtener un estudio específico por ID
  getStudio(id: number): Observable<Studio> {
    return this.http.get<Studio>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo estudio
  createStudio(studio: { name: string }): Observable<Studio> {
    return this.http.post<Studio>(this.apiUrl, studio, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un estudio existente
  updateStudio(id: number, studio: { name: string }): Observable<Studio> {
    return this.http.put<Studio>(`${this.apiUrl}/${id}`, studio, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un estudio (soft delete)
  deleteStudio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un estudio eliminado
  restoreStudio(id: number): Observable<Studio> {
    return this.http.post<Studio>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un estudio permanentemente
  forceDeleteStudio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}