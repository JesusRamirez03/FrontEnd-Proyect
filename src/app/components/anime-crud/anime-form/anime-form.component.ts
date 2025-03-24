import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimeService, Anime, Studio, Genre } from '../../../services/anime/anime.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-anime-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './anime-form.component.html',
  styleUrls: ['./anime-form.component.css'],
})
export class AnimeFormComponent implements OnInit {
  animeForm: FormGroup; // Formulario reactivo
  isEditMode = false; // Modo edición o creación
  animeId: number | null = null; // ID del anime (si está en modo edición)
  studios: Studio[] = []; // Lista de estudios
  genres: Genre[] = []; // Lista de géneros

  // Inyección de dependencias con inject()
  private fb = inject(FormBuilder);
  private animeService = inject(AnimeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // Inicializar el formulario en el constructor
    this.animeForm = this.fb.group({
      title: ['', Validators.required],
      synopsis: ['', Validators.required],
      release_date: ['', Validators.required],
      studio_id: [0, Validators.required],
      genres: [[] as number[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.animeId = this.route.snapshot.params['id'];
    if (this.animeId) {
      this.isEditMode = true;
      this.loadAnime(this.animeId); // Cargar datos del anime si está en modo edición
    }

    // Cargar estudios y géneros
    this.loadStudios();
    this.loadGenres();
  }

  // Cargar datos del anime (modo edición)
  async loadAnime(id: number): Promise<void> {
    try {
      const anime = await lastValueFrom(this.animeService.getAnime(id));
      this.animeForm.patchValue({
        ...anime,
        studio_id: anime.studio.id,
        genres: anime.genres.map((genre) => genre.id),
      });
    } catch (error) {
      this.snackBar.open('Error al cargar anime', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de estudios
  async loadStudios(): Promise<void> {
    try {
      this.studios = await lastValueFrom(this.animeService.getStudios());
    } catch (error) {
      this.snackBar.open('Error al cargar estudios', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de géneros
  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.animeService.getGenres());
    } catch (error) {
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  // Manejar la selección de géneros
  toggleGenre(genreId: number): void {
    const selectedGenres = this.animeForm.get('genres')?.value as number[];
    const index = selectedGenres.indexOf(genreId);
    if (index === -1) {
      selectedGenres.push(genreId); // Agregar el género seleccionado
    } else {
      selectedGenres.splice(index, 1); // Remover el género si ya está seleccionado
    }
    this.animeForm.get('genres')?.setValue(selectedGenres);
  }

  // Verificar si un género está seleccionado
  isGenreSelected(genreId: number): boolean {
    const selectedGenres = this.animeForm.get('genres')?.value as number[];
    return selectedGenres.includes(genreId);
  }

  // Enviar el formulario (crear o actualizar)
  async onSubmit(): Promise<void> {
    if (this.animeForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    const animeData = this.animeForm.value; // Obtener datos del formulario
    try {
      if (this.isEditMode && this.animeId) {
        // Modo edición: Actualizar anime
        await lastValueFrom(this.animeService.updateAnime(this.animeId, animeData));
        this.snackBar.open('Anime actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Modo creación: Crear anime
        await lastValueFrom(this.animeService.createAnime(animeData));
        this.snackBar.open('Anime creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToAnimeList(); // Redirigir a la lista de animes
    } catch (error) {
      this.snackBar.open('Error al guardar anime', 'Cerrar', { duration: 3000 });
    }
  }

  // Redirigir a la lista de animes
  navigateToAnimeList(): void {
    this.router.navigate(['/animes']);
  }
}