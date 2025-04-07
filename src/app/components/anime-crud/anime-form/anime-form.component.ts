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
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-anime-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './anime-form.component.html',
  styleUrls: ['./anime-form.component.css']
})
export class AnimeFormComponent implements OnInit {
  animeForm: FormGroup;
  isEditMode = false;
  animeId: number | null = null;
  studios: Studio[] = [];
  genres: Genre[] = [];
  loading = false;
  loadingData = true;

  private fb = inject(FormBuilder);
  private animeService = inject(AnimeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.animeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      synopsis: ['', [Validators.required, Validators.minLength(10)]],
      release_date: ['', Validators.required],
      studio_id: [null, Validators.required],
      genres: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  async ngOnInit(): Promise<void> {
    this.animeId = this.route.snapshot.params['id'];
    
    try {
      await Promise.all([
        this.loadStudios(),
        this.loadGenres()
      ]);

      if (this.animeId) {
        this.isEditMode = true;
        await this.loadAnime(this.animeId);
      }
    } catch (error) {
      this.snackBar.open('Error al cargar datos del formulario', 'Cerrar', { duration: 3000 });
    } finally {
      this.loadingData = false;
    }
  }

  async loadAnime(id: number): Promise<void> {
    try {
      const anime = await lastValueFrom(this.animeService.getAnime(id));
      this.animeForm.patchValue({
        title: anime.title,
        synopsis: anime.synopsis,
        release_date: anime.release_date,
        studio_id: anime.studio.id,
        genres: anime.genres.map(genre => genre.id)
      });
    } catch (error) {
      throw error;
    }
  }

  async loadStudios(): Promise<void> {
    try {
      this.studios = await lastValueFrom(this.animeService.getStudios());
    } catch (error) {
      throw error;
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.animeService.getGenres());
    } catch (error) {
      throw error;
    }
  }

  toggleGenre(genreId: number): void {
    const genresControl = this.animeForm.get('genres');
    const currentGenres: number[] = genresControl?.value || [];
    const index = currentGenres.indexOf(genreId);
    
    if (index === -1) {
      genresControl?.setValue([...currentGenres, genreId]);
    } else {
      genresControl?.setValue(currentGenres.filter(id => id !== genreId));
    }
    genresControl?.markAsTouched();
  }

  isGenreSelected(genreId: number): boolean {
    const selectedGenres: number[] = this.animeForm.get('genres')?.value || [];
    return selectedGenres.includes(genreId);
  }

  async onSubmit(): Promise<void> {
    if (this.animeForm.invalid) {
      this.markFormGroupTouched(this.animeForm);
      return;
    }

    this.loading = true;
    const formData = {
      ...this.animeForm.value,
      release_date: this.formatDate(this.animeForm.value.release_date)
    };

    try {
      if (this.isEditMode && this.animeId) {
        await lastValueFrom(this.animeService.updateAnime(this.animeId, formData));
        this.snackBar.open('Anime actualizado correctamente', 'Cerrar', { duration: 3000 });
      } else {
        await lastValueFrom(this.animeService.createAnime(formData));
        this.snackBar.open('Anime creado correctamente', 'Cerrar', { duration: 3000 });
      }
      this.router.navigate(['/animes']);
    } catch (error) {
      console.error('Error:', error);
      this.snackBar.open('Error al guardar el anime. Por favor, inténtelo nuevamente.', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  private formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    return date;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateToAnimeList(): void {
    this.router.navigate(['/animes']);
  }
}