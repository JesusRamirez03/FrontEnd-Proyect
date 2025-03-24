import { Component, inject, OnInit } from '@angular/core';
import { CharacterService, Character } from '../../services/character/character.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-character-crud',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './character-crud.component.html',
  styleUrls: ['./character-crud.component.css'],
})
export class CharacterCrudComponent implements OnInit {
  allCharacters: Character[] = []; // Todos los personajes
  activeCharacters: Character[] = []; // Personajes activos
  deletedCharacters: Character[] = []; // Personajes eliminados
  userRole: string | null = ''; // Rol del usuario
  userName: string | null = ''; // Nombre del usuario

  // Inyección de dependencias con inject()
  private characterService = inject(CharacterService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadCharacters();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async loadCharacters(): Promise<void> {
    try {
      this.allCharacters = await lastValueFrom(this.characterService.getCharacters());
      this.activeCharacters = this.allCharacters.filter(character => !character.deleted_at); // Personajes activos
      this.deletedCharacters = this.allCharacters.filter(character => character.deleted_at); // Personajes eliminados
    } catch (error) {
      this.snackBar.open('Error al cargar personajes', 'Cerrar', { duration: 3000 });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/characters/create']);
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/characters/edit/${id}`]);
  }

  async deleteCharacter(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este personaje?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.characterService.deleteCharacter(id));
          this.snackBar.open('Personaje eliminado', 'Cerrar', { duration: 3000 });
          this.loadCharacters();
        } catch (error) {
          this.snackBar.open('Error al eliminar personaje', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  async restoreCharacter(id: number): Promise<void> {
    try {
      await lastValueFrom(this.characterService.restoreCharacter(id));
      this.snackBar.open('Personaje restaurado', 'Cerrar', { duration: 3000 });
      this.loadCharacters();
    } catch (error) {
      this.snackBar.open('Error al restaurar personaje', 'Cerrar', { duration: 3000 });
    }
  }

  async forceDeleteCharacter(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de que deseas eliminar este personaje permanentemente?' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await lastValueFrom(this.characterService.forceDeleteCharacter(id));
          this.snackBar.open('Personaje eliminado permanentemente', 'Cerrar', { duration: 3000 });
          this.loadCharacters();
        } catch (error) {
          this.snackBar.open('Error al eliminar personaje', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}