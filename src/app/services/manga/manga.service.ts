import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Manga {
  id: number;
  title: string;
  synopsis: string;
  release_date: string;
  author_id: number;
  author: Author; // Agregar esta propiedad
  genres: { id: number; name: string }[];
  deleted_at?: string | null; // Para manejar soft delete
}

export interface Author {
  id: number;
  name: string;
  deleted_at?: string | null; // Propiedad opcional
}

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null; // Propiedad opcional
}

@Injectable({
  providedIn: 'root',
})
export class MangaService {
  private apiUrl = 'http://127.0.0.1:8000/api/mangas'; // URL de la API de mangas
  private authorsUrl = 'http://127.0.0.1:8000/api/authors'; // URL de la API de autores
  private genresUrl = 'http://127.0.0.1:8000/api/genres'; // URL de la API de géneros

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

  // Obtener todos los mangas (incluyendo eliminados)
  getMangas(): Observable<Manga[]> {
    return this.http.get<Manga[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener la lista de autores
  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.authorsUrl, { headers: this.getHeaders() }).pipe(
      map((authors: Author[]) => authors.filter(author => author.deleted_at === null )),
      catchError(this.handleError)
    );
  }
  
  // Obtener la lista de géneros
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.genresUrl, { headers: this.getHeaders() }).pipe(
      map((genres: Genre[]) => genres.filter(genre => genre.deleted_at === null)),
      catchError(this.handleError)
    );
  }

  // Obtener un manga específico por ID
  getManga(id: number): Observable<Manga> {
    return this.http.get<Manga>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo manga
  createManga(manga: {
    title: string;
    synopsis: string;
    release_date: string;
    author_id: number;
    genres: number[];
  }): Observable<Manga> {
    return this.http.post<Manga>(this.apiUrl, manga, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un manga existente
  updateManga(id: number, manga: {
    title?: string;
    synopsis?: string;
    release_date?: string;
    author_id?: number;
    genres?: number[];
  }): Observable<Manga> {
    return this.http.put<Manga>(`${this.apiUrl}/${id}`, manga, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un manga (soft delete)
  deleteManga(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un manga eliminado
  restoreManga(id: number): Observable<Manga> {
    return this.http.post<Manga>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un manga permanentemente
  forceDeleteManga(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}