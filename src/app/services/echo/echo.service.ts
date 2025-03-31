import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo: Echo<'pusher'>
  


  constructor() {
    (window as any).Pusher = Pusher;

    this.echo = new Echo<'pusher'>({
      broadcaster: 'pusher',
      key: '1aa69849a9966b2359ee',
      cluster: 'us2',
      forceTLS: true,
      client: new Pusher('1aa69849a9966b2359ee', {
        cluster: 'us2',
        forceTLS: true,
      }),
    });

    // Logs de conexión y errores
    this.echo.connector.pusher.connection.bind('connected', () => {
      console.log(' Conectado a Pusher correctamente');
    });

    this.echo.connector.pusher.connection.bind('error', (error: any) => {
      console.error(' Error en la conexión Pusher:', error);
    });
  }

  listen(channel: string, event: string, callback: (data: any) => void) {
    console.log(`Suscrito a: ${channel} (Evento: ${event})`);
    this.echo.channel(channel).listen(event, (data: any) => {
      console.log('📬 Evento recibido:', { channel, event, data });
      callback(data);
    });
  }

  leave(channel: string) {
    console.log(`Abandonando canal: ${channel}`);
    this.echo.leave(channel);
  }
}