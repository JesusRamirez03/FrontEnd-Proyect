import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, interval, startWith, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null;
}

export interface PaginatedGenres {
  genres: Genre[];
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

  // Modificar el método getGenres
  getGenres(page: number = 1, perPage: number = 10): Observable<PaginatedGenres> {
    const params = { 
      page: page.toString(), 
      per_page: perPage.toString() 
    };
    
    return this.http.get<PaginatedGenres>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar el polling
  getGenresWithPolling(intervalTime: number, page: number = 1): Observable<PaginatedGenres> {
    return interval(intervalTime).pipe(
      startWith(0),
      switchMap(() => this.getGenres(page))
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