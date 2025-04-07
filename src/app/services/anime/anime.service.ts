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
  studio: Studio;
  genres: Genre[];
  deleted_at?: string | null;
}

interface PaginatedResponse {
  animes: Anime[];
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
export class AnimeService {
  private apiUrl = 'http://127.0.0.1:8000/api/animes';
  private studiosUrl = 'http://127.0.0.1:8000/api/studios';
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

  getAnimes(): Observable<Anime[]> {
    return this.http.get<Anime[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getAnime(id: number): Observable<Anime> {
    return this.http.get<Anime>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getAnimesPaginated(page: number, perPage: number, deletedOnly: boolean = false): Observable<PaginatedResponse> {
    const params = {
      page: page.toString(),
      per_page: perPage.toString(),
      deleted_only: deletedOnly ? 'true' : 'false'
    };

    return this.http.get<PaginatedResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError)
    );
  }


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

  deleteAnime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  restoreAnime(id: number): Observable<Anime> {
    return this.http.post<Anime>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  forceDeleteAnime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getStudios(): Observable<Studio[]> {
    return this.http.get<Studio[]>(`${this.studiosUrl}/all`, { headers: this.getHeaders() }).pipe(
      map((studios: Studio[]) => studios.filter(studio => !studio.deleted_at)),
      catchError(this.handleError)
    );
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.genresUrl}/all`, { headers: this.getHeaders() }).pipe(
      map((genres: Genre[]) => genres.filter(genre => !genre.deleted_at)),
      catchError(this.handleError)
    );
  }
}