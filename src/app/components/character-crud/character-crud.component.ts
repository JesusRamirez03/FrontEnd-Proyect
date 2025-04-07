import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CharacterService, Character, Anime, Manga } from '../../services/character/character.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../author-crud/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-character-crud',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './character-crud.component.html',
  styleUrls: ['./character-crud.component.css'],
})
export class CharacterCrudComponent implements OnInit, OnDestroy {
  allCharacters: Character[] = [];
  activeCharacters: Character[] = [];
  deletedCharacters: Character[] = [];
  userRole: string | null = '';
  userName: string | null = '';
  loading: boolean = true;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Inyección de dependencias
  private characterService = inject(CharacterService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userName = this.authService.getUserName();
    this.loadAllData();
  }

  async loadAllData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadCharacters(),
        this.loadAnimes(),
        this.loadMangas()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.snackBar.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async loadCharacters(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.characterService.getCharactersPaginated(this.currentPage, this.itemsPerPage)
      );
      this.allCharacters = response.characters;
      this.activeCharacters = this.allCharacters.filter(character => !character.deleted_at);
      this.deletedCharacters = this.allCharacters.filter(character => character.deleted_at);
      this.totalItems = response.pagination.total;
      this.totalPages = response.pagination.last_page;
    } catch (error) {
      this.snackBar.open('Error al cargar personajes', 'Cerrar', { duration: 3000 });
    }
  }

  async loadAnimes(): Promise<void> {
    try {
      const animes = await lastValueFrom(this.characterService.getAnimes());
      // Puedes almacenarlos si necesitas más funcionalidad
    } catch (error) {
      console.error('Error loading animes:', error);
    }
  }

  async loadMangas(): Promise<void> {
    try {
      const mangas = await lastValueFrom(this.characterService.getMangas());
      // Puedes almacenarlos si necesitas más funcionalidad
    } catch (error) {
      console.error('Error loading mangas:', error);
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadCharacters();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCharacters();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCharacters();
    }
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCharacters();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/characters/create']);
  }

  navigateToUpdate(id: number): void {
    this.router.navigate([`/characters/edit/${id}`]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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

  ngOnDestroy(): void {
    // Limpieza si es necesaria
  }
}