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

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.css'],
})
export class CharacterFormComponent implements OnInit {
  characterForm: FormGroup; // Formulario reactivo
  isEditMode = false; // Modo edición o creación
  characterId: number | null = null; // ID del personaje (si está en modo edición)
  animes: Anime[] = []; // Lista de animes
  mangas: Manga[] = []; // Lista de mangas

  // Inyección de dependencias con inject()
  private fb = inject(FormBuilder);
  private characterService = inject(CharacterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // Inicializar el formulario reactivo
    this.characterForm = this.fb.group({
      name: ['', Validators.required],
      anime_id: [null],
      manga_id: [null],
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.characterId = this.route.snapshot.params['id'];
    if (this.characterId) {
      this.isEditMode = true;
      this.loadCharacter(this.characterId); // Cargar datos del personaje si está en modo edición
    }

    // Cargar animes y mangas
    this.loadAnimes();
    this.loadMangas();
  }

  // Cargar datos del personaje (modo edición)
  async loadCharacter(id: number): Promise<void> {
    try {
      const character = await lastValueFrom(this.characterService.getCharacter(id));
      this.characterForm.patchValue({
        ...character,
        anime_id: character.anime?.id || null,
        manga_id: character.manga?.id || null,
      });
    } catch (error) {
      this.snackBar.open('Error al cargar personaje', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de animes
  async loadAnimes(): Promise<void> {
    try {
      this.animes = await lastValueFrom(this.characterService.getAnimes());
    } catch (error) {
      this.snackBar.open('Error al cargar animes', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de mangas
  async loadMangas(): Promise<void> {
    try {
      this.mangas = await lastValueFrom(this.characterService.getMangas());
    } catch (error) {
      this.snackBar.open('Error al cargar mangas', 'Cerrar', { duration: 3000 });
    }
  }

  // Enviar el formulario (crear o actualizar)
  async onSubmit(): Promise<void> {
    if (this.characterForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    const characterData = this.characterForm.value; // Obtener datos del formulario
    try {
      if (this.isEditMode && this.characterId) {
        // Modo edición: Actualizar personaje
        await lastValueFrom(this.characterService.updateCharacter(this.characterId, characterData));
        this.snackBar.open('Personaje actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Modo creación: Crear personaje
        await lastValueFrom(this.characterService.createCharacter(characterData));
        this.snackBar.open('Personaje creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToCharacterList(); // Redirigir a la lista de personajes
    } catch (error) {
      this.snackBar.open('Error al guardar personaje', 'Cerrar', { duration: 3000 });
    }
  }

  // Redirigir a la lista de personajes
  navigateToCharacterList(): void {
    this.router.navigate(['/characters']);
  }
}