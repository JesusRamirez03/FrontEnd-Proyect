import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Studio {
  id: number;
  name: string;
  deleted_at?: string | null; 
}

export interface Genre {
  id: number;
  name: string;
  deleted_at?: string | null; 
}

export interface Anime {
  id: number;
  title: string;
  synopsis: string;
  release_date: string;
  studio_id: number;
  studio: Studio; // Relación con el estudio
  genres: Genre[]; // Relación con los géneros
  deleted_at?: string | null; // Para manejar soft delete
}

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private apiUrl = 'http://127.0.0.1:8000/api/animes'; // URL de la API de animes
  private studiosUrl = 'http://127.0.0.1:8000/api/studios'; // URL de la API de estudios
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

  // Obtener todos los animes (incluyendo eliminados)
  getAnimes(): Observable<Anime[]> {
    return this.http.get<Anime[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un anime específico por ID
  getAnime(id: number): Observable<Anime> {
    return this.http.get<Anime>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo anime
  createAnime(anime: {
    title: string;
    synopsis: string;
    release_date: string;
    studio_id: number;
    genres: number[];
  }): Observable<Anime> {
    return this.http.post<Anime>(this.apiUrl, anime, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un anime existente
  updateAnime(id: number, anime: {
    title?: string;
    synopsis?: string;
    release_date?: string;
    studio_id?: number;
    genres?: number[];
  }): Observable<Anime> {
    return this.http.put<Anime>(`${this.apiUrl}/${id}`, anime, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un anime (soft delete)
  deleteAnime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un anime eliminado
  restoreAnime(id: number): Observable<Anime> {
    return this.http.post<Anime>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un anime permanentemente
  forceDeleteAnime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener la lista de estudios
  getStudios(): Observable<Studio[]> {
    return this.http.get<Studio[]>(this.studiosUrl, { headers: this.getHeaders() }).pipe(
      map((studios: Studio[]) => studios.filter(studio => studio.deleted_at === null)),
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
}