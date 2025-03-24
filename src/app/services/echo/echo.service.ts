import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo: Echo<'pusher'>


  constructor() {
    // Hacer Pusher globalmente disponible
    (window as any).Pusher = Pusher;

    // Configurar Laravel Echo
    this.echo = new Echo<'pusher'>({
      broadcaster: 'pusher',
      key: '6b4e2c91d1bec0756f1f', // Reemplaza con tu clave de Pusher
      cluster: 'us2', // Reemplaza con tu cluster de Pusher
      forceTLS: true,
      client: new Pusher('6b4e2c91d1bec0756f1f', { // Pasar Pusher explícitamente
        cluster: 'us2',
        forceTLS: true,
      }),
    });
  }

 
  

  // Método para escuchar un canal
  listen(channel: string, event: string, callback: (data: any) => void) {
    this.echo.channel(channel).listen(event, callback);
  }

  // Método para dejar de escuchar un canal
  leave(channel: string) {
    this.echo.leave(channel);
  }
}