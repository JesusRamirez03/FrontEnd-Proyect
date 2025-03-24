import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, interval, startWith, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private apiUrl = 'http://127.0.0.1:8000/api/genres'; // URL de la API de géneros

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método para construir las cabeceras HTTP con el token de autenticación
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Obtener el token desde AuthService
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
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Obtener todos los géneros
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getGenresWithPolling(intervalTime: number): Observable<Genre[]> {
    return interval(intervalTime).pipe(
      startWith(0), // Emite un valor inmediatamente al suscribirse
      switchMap(() => this.getGenres()) // Realiza la solicitud HTTP cada intervalo
    );
  }

  // Obtener un género específico por ID
  getGenre(id: number): Observable<Genre> {
    return this.http.get<Genre>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo género
  createGenre(genre: { name: string }): Observable<Genre> {
    return this.http.post<Genre>(this.apiUrl, genre, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un género existente
  updateGenre(id: number, genre: { name: string }): Observable<Genre> {
    return this.http.put<Genre>(`${this.apiUrl}/${id}`, genre, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un género (soft delete)
  deleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un género eliminado
  restoreGenre(id: number): Observable<Genre> {
    return this.http.post<Genre>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un género permanentemente
  forceDeleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}