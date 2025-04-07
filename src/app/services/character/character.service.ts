import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Anime {
  id: number;
  title: string;
  deleted_at?: string | null; // Para manejar soft delete
}

export interface Manga {
  id: number;
  title: string;
  deleted_at?: string | null; // Para manejar soft delete
}

export interface Character {
  id: number;
  name: string;
  anime_id: number | null;
  manga_id: number | null;
  anime: Anime | null; // Relación con el anime
  manga: Manga | null; // Relación con el manga
  deleted_at?: string | null; // Para manejar soft delete
}

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private apiUrl = 'http://127.0.0.1:8000/api/characters'; // URL de la API de personajes
  private animesUrl = 'http://127.0.0.1:8000/api/animes'; // Nueva ruta sin paginación
  private mangasUrl = 'http://127.0.0.1:8000/api/mangas'; // Nueva ruta sin paginación

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

  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener personajes CON paginación (nuevo método)
  getCharactersPaginated(page: number = 1, perPage: number = 10): Observable<{characters: Character[], pagination: any}> {
    const params = {
      page: page.toString(),
      per_page: perPage.toString()
    };

    return this.http.get<{characters: Character[], pagination: any}>(
      this.apiUrl, 
      { 
        headers: this.getHeaders(),
        params: params 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }


  // Obtener un personaje específico por ID
  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo personaje
  createCharacter(character: {
    name: string;
    anime_id: number | null;
    manga_id: number | null;
  }): Observable<Character> {
    return this.http.post<Character>(this.apiUrl, character, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un personaje existente
  updateCharacter(id: number, character: {
    name?: string;
    anime_id?: number | null;
    manga_id?: number | null;
  }): Observable<Character> {
    return this.http.put<Character>(`${this.apiUrl}/${id}`, character, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un personaje (soft delete)
  deleteCharacter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un personaje eliminado
  restoreCharacter(id: number): Observable<Character> {
    return this.http.post<Character>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un personaje permanentemente
  forceDeleteCharacter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/force-delete`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener la lista de animes
  getAnimes(): Observable<Anime[]> {
    return this.http.get<Anime[]>(`${this.animesUrl}/all`, { 
      headers: this.getHeaders() 
    }).pipe(
      map((animes: Anime[]) => animes.filter(anime => anime.deleted_at === null)),
      catchError(this.handleError)
    );
  }
  // Obtener la lista de mangas
  getMangas(): Observable<Manga[]> {
    return this.http.get<Manga[]>(`${this.mangasUrl}/all`, { 
      headers: this.getHeaders() 
    }).pipe(
      map((mangas: Manga[]) => mangas.filter(manga => manga.deleted_at === null)),
      catchError(this.handleError)
    );
  }
}