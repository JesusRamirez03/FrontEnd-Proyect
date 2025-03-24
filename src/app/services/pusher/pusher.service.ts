import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  private pusher: Pusher;
  public channel: any;

  constructor() {
    this.pusher = new Pusher('6b4e2c91d1bec0756f1f', { // Usa tu PUSHER_APP_KEY
      cluster: 'us2', // Usa tu PUSHER_APP_CLUSTER
      forceTLS: true,
    });

    this.channel = this.pusher.subscribe('authors');
  }

  listen(eventName: string, callback: (data: any) => void) {
    this.channel.bind(eventName, callback);
  }
}