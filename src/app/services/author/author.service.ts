import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Author {
  id: number;
  name: string;
  deleted_at?: string | null; // Para manejar soft delete
}

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private apiUrl = 'http://127.0.0.1:8000/api/authors'; // URL de la API de autores

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }
  // Obtener un autor específico por ID
  getAuthor(id: number): Observable<Author> {
    return this.http.get<Author>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo autor
  createAuthor(author: { name: string }): Observable<Author> {
    return this.http.post<Author>(this.apiUrl, author, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un autor existente
  updateAuthor(id: number, author: { name: string }): Observable<Author> {
    return this.http.put<Author>(`${this.apiUrl}/${id}`, author, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un autor (soft delete)
  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un autor eliminado
  restoreAuthor(id: number): Observable<Author> {
    return this.http.post<Author>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un autor permanentemente
  forceDeleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}