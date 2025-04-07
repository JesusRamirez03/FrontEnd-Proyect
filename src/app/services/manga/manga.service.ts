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
  author: Author;
  genres: { id: number; name: string }[];
  deleted_at?: string | null;
}

export interface Author {
  id: number;
  name: string;
  deleted_at?: string | null;
}

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = 'http://127.0.0.1:8000/api/mangas';
  private authorsUrl = 'http://127.0.0.1:8000/api/authors';
  private genresUrl = 'http://127.0.0.1:8000/api/genres';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en la solicitud';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código ${error.status}: ${error.error.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Obtener todos los mangas (sin paginación)
  getMangas(): Observable<Manga[]> {
    return this.http.get<Manga[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener mangas con paginación
  getMangasPaginated(page: number = 1, perPage: number = 10): Observable<{mangas: Manga[], pagination: any}> {
    const params = { page: page.toString(), per_page: perPage.toString() };
    return this.http.get<{mangas: Manga[], pagination: any}>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un manga específico
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

  // Actualizar un manga
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

  // Restaurar un manga
  restoreManga(id: number): Observable<Manga> {
    return this.http.post<Manga>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar permanentemente un manga
  forceDeleteManga(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener autores
  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(`${this.authorsUrl}/all`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener géneros
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.genresUrl}/all`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}