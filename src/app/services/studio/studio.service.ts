import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Studio {
  id: number;
  name: string;
  deleted_at?: string | null; // Para manejar soft delete
}

@Injectable({
  providedIn: 'root',
})
export class StudioService {
  private apiUrl = 'http://127.0.0.1:8000/api/studios'; // URL de la API de estudios

  private sseUrl = 'http://127.0.0.1:8000/api/studios/stream';
  private eventSource: EventSource | null = null;
  private studioUpdates = new Subject<Studio[]>();

  constructor(private http: HttpClient, private authService: AuthService, private zone: NgZone) {
    console.log('[SSE Service] Servicio SSE inicializado');
  }

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

  // Observable para suscribirse a actualizaciones
  getStudioUpdates(): Observable<Studio[]> {
    return this.studioUpdates.asObservable();
  }

  // Conexión SSE
  connectToStudioStream(): void {
    console.log('[SSE Service] Conectando al stream SSE...');
    
    this.zone.runOutsideAngular(() => {
      this.disconnect();

      this.eventSource = new EventSource(this.sseUrl);

      this.eventSource.onopen = () => {
        console.log('[SSE Service] Conexión SSE establecida');
      };

      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data);
            console.log('[SSE Service] Datos recibidos:', data);
            this.studioUpdates.next(data.studios);
          } catch (error) {
            console.error('[SSE Service] Error al parsear datos SSE:', error);
          }
        });
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE Service] Error en la conexión SSE:', error);
        this.zone.run(() => {
          this.disconnect();
          console.log('[SSE Service] Intentando reconexión en 5 segundos...');
          setTimeout(() => this.connectToStudioStream(), 5000);
        });
      };
    });
  }

  // Cerrar conexión
  disconnect(): void {
    if (this.eventSource) {
      console.log('[SSE Service] Cerrando conexión SSE');
      this.eventSource.close();
      this.eventSource = null;
    }
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
  getStudios(): Observable<Studio[]> {
    return this.http.get<Studio[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
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