import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService, Character, Anime, Manga } from '../../../services/character/character.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinner
  ],
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.css'],
})
export class CharacterFormComponent implements OnInit {
  characterForm: FormGroup;
  isEditMode = false;
  characterId: number | null = null;
  animes: Anime[] = [];
  mangas: Manga[] = [];
  loading = false;

  loadingAnimes = false;
  loadingMangas = false;
  loadError = '';

  private fb = inject(FormBuilder);
  private characterService = inject(CharacterService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.characterForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      anime_id: [null],
      manga_id: [null]
    });
  }

  ngOnInit(): void {
    this.characterId = this.route.snapshot.params['id'];
    if (this.characterId) {
      this.isEditMode = true;
      this.loadCharacter(this.characterId);
    }
    this.loadData();
  }

  async loadData(): Promise<void> {
    await Promise.all([this.loadAnimes(), this.loadMangas()]);
  }

  async loadCharacter(id: number): Promise<void> {
    try {
      this.loading = true;
      const character = await lastValueFrom(this.characterService.getCharacter(id));
      
      console.log('Datos del personaje recibidos:', character); // Para debug
      
      this.characterForm.patchValue({
        name: character.name,
        anime_id: character.anime?.id || null,
        manga_id: character.manga?.id || null
      });
    } catch (error) {
      console.error('Error al cargar personaje:', error);
      this.showError('Error al cargar personaje');
    } finally {
      this.loading = false;
    }
  }

  async loadAnimes(): Promise<void> {
    this.loadingAnimes = true;
    this.loadError = '';
    try {
      const response = await lastValueFrom(this.characterService.getAnimes());
      console.log('Animes cargados:', response); // Debug
      this.animes = response;
    } catch (error) {
      console.error('Error cargando animes:', error); // Debug
      this.loadError = 'Error al cargar animes';
      this.snackBar.open(this.loadError, 'Cerrar', { duration: 3000 });
    } finally {
      this.loadingAnimes = false;
    }
  }


  async loadMangas(): Promise<void> {
    this.loadingMangas = true;
    this.loadError = '';
    try {
      const response = await lastValueFrom(this.characterService.getMangas());
      console.log('Mangas cargados:', response); // Debug
      this.mangas = response;
    } catch (error) {
      console.error('Error cargando mangas:', error); // Debug
      this.loadError = 'Error al cargar mangas';
      this.snackBar.open(this.loadError, 'Cerrar', { duration: 3000 });
    } finally {
      this.loadingMangas = false;
    }
  }


  async onSubmit(): Promise<void> {
    if (this.characterForm.invalid) return;

    this.loading = true;
    const formData = this.characterForm.value;

    try {
      if (this.isEditMode && this.characterId) {
        await lastValueFrom(this.characterService.updateCharacter(this.characterId, formData));
        this.showSuccess('Personaje actualizado correctamente');
      } else {
        await lastValueFrom(this.characterService.createCharacter(formData));
        this.showSuccess('Personaje creado correctamente');
      }
      this.router.navigate(['/characters']);
    } catch (error) {
      this.showError('Error al guardar personaje');
    } finally {
      this.loading = false;
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}