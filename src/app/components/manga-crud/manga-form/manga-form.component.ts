import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MangaService } from '../../../services/manga/manga.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { Author, Genre } from '../../../services/manga/manga.service';

@Component({
  selector: 'app-manga-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './manga-form.component.html',
  styleUrls: ['./manga-form.component.css'],
})
export class MangaFormComponent implements OnInit {
  mangaForm: FormGroup; // Formulario reactivo
  isEditMode = false; // Modo edición o creación
  mangaId: number | null = null; // ID del manga (si está en modo edición)
  authors: Author[] = []; // Lista de autores
  genres: Genre[] = []; // Lista de géneros

  // Inyección de dependencias con inject()
  private fb = inject(FormBuilder);
  private mangaService = inject(MangaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // Inicializar el formulario en el constructor
    this.mangaForm = this.fb.group({
      title: ['', Validators.required],
      synopsis: ['', Validators.required],
      release_date: ['', Validators.required],
      author_id: [0, Validators.required],
      genres: [[] as number[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.mangaId = this.route.snapshot.params['id'];
    if (this.mangaId) {
      this.isEditMode = true;
      this.loadManga(this.mangaId); // Cargar datos del manga si está en modo edición
    }

    // Cargar autores y géneros
    this.loadAuthors();
    this.loadGenres();
  }

  // Cargar datos del manga (modo edición)
  async loadManga(id: number): Promise<void> {
    try {
      const manga = await lastValueFrom(this.mangaService.getManga(id));
      this.mangaForm.patchValue({
        ...manga,
        author_id: manga.author.id,
        genres: manga.genres.map((genre) => genre.id),
      });
    } catch (error) {
      this.snackBar.open('Error al cargar manga', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de autores
  async loadAuthors(): Promise<void> {
    try {
      this.authors = await lastValueFrom(this.mangaService.getAuthors());
    } catch (error) {
      this.snackBar.open('Error al cargar autores', 'Cerrar', { duration: 3000 });
    }
  }

  // Cargar la lista de géneros
  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.mangaService.getGenres());
    } catch (error) {
      this.snackBar.open('Error al cargar géneros', 'Cerrar', { duration: 3000 });
    }
  }

  // Manejar la selección de géneros
  toggleGenre(genreId: number): void {
    const selectedGenres = this.mangaForm.get('genres')?.value as number[];
    const index = selectedGenres.indexOf(genreId);
    if (index === -1) {
      selectedGenres.push(genreId); // Agregar el género seleccionado
    } else {
      selectedGenres.splice(index, 1); // Remover el género si ya está seleccionado
    }
    this.mangaForm.get('genres')?.setValue(selectedGenres);
  }

  // Verificar si un género está seleccionado
  isGenreSelected(genreId: number): boolean {
    const selectedGenres = this.mangaForm.get('genres')?.value as number[];
    return selectedGenres.includes(genreId);
  }

  // Enviar el formulario (crear o actualizar)
  async onSubmit(): Promise<void> {
    if (this.mangaForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    const mangaData = this.mangaForm.value; // Obtener datos del formulario
    try {
      if (this.isEditMode && this.mangaId) {
        // Modo edición: Actualizar manga
        await lastValueFrom(this.mangaService.updateManga(this.mangaId, mangaData));
        this.snackBar.open('Manga actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Modo creación: Crear manga
        await lastValueFrom(this.mangaService.createManga(mangaData));
        this.snackBar.open('Manga creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToMangaList(); // Redirigir a la lista de mangas
    } catch (error) {
      this.snackBar.open('Error al guardar manga', 'Cerrar', { duration: 3000 });
    }
  }

  // Redirigir a la lista de mangas
  navigateToMangaList(): void {
    this.router.navigate(['/mangas']);
  }
}