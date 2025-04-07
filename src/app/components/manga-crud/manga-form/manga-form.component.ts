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
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-manga-form',
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
    MatProgressSpinner
  ],
  templateUrl: './manga-form.component.html',
  styleUrls: ['./manga-form.component.css']
})
export class MangaFormComponent implements OnInit {
  mangaForm: FormGroup;
  isEditMode = false;
  mangaId: number | null = null;
  authors: Author[] = [];
  genres: Genre[] = [];
  loading = false;

  private fb = inject(FormBuilder);
  private mangaService = inject(MangaService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.mangaForm = this.fb.group({
      title: ['', Validators.required],
      synopsis: ['', Validators.required],
      release_date: ['', Validators.required],
      author_id: ['', Validators.required],
      genres: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.mangaId = this.route.snapshot.params['id'];
    if (this.mangaId) {
      this.isEditMode = true;
      this.loadManga(this.mangaId);
    }
    this.loadAuthors();
    this.loadGenres();
  }

  async loadManga(id: number): Promise<void> {
    try {
      const manga = await lastValueFrom(this.mangaService.getManga(id));
      this.mangaForm.patchValue({
        title: manga.title,
        synopsis: manga.synopsis,
        release_date: manga.release_date,
        author_id: manga.author.id,
        genres: manga.genres.map(genre => genre.id)
      });
    } catch (error) {
      this.showError('Error al cargar manga');
    }
  }

  async loadAuthors(): Promise<void> {
    try {
      this.authors = await lastValueFrom(this.mangaService.getAuthors());
    } catch (error) {
      this.showError('Error al cargar autores');
    }
  }

  async loadGenres(): Promise<void> {
    try {
      this.genres = await lastValueFrom(this.mangaService.getGenres());
    } catch (error) {
      this.showError('Error al cargar géneros');
    }
  }

  toggleGenre(genreId: number): void {
    const genresControl = this.mangaForm.get('genres');
    const currentGenres: number[] = genresControl?.value || [];
    const index = currentGenres.indexOf(genreId);
    
    if (index === -1) {
      genresControl?.setValue([...currentGenres, genreId]);
    } else {
      genresControl?.setValue(currentGenres.filter(id => id !== genreId));
    }
  }

  isGenreSelected(genreId: number): boolean {
    const selectedGenres: number[] = this.mangaForm.get('genres')?.value || [];
    return selectedGenres.includes(genreId);
  }

  async onSubmit(): Promise<void> {
    if (this.mangaForm.invalid) return;

    this.loading = true;
    const formData = {
      ...this.mangaForm.value,
      release_date: this.formatDate(this.mangaForm.value.release_date)
    };

    try {
      if (this.isEditMode && this.mangaId) {
        await lastValueFrom(this.mangaService.updateManga(this.mangaId, formData));
        this.showSuccess('Manga actualizado correctamente');
      } else {
        await lastValueFrom(this.mangaService.createManga(formData));
        this.showSuccess('Manga creado correctamente');
      }
      this.router.navigate(['/mangas']);
    } catch (error) {
      this.showError('Error al guardar manga');
    } finally {
      this.loading = false;
    }
  }

  private formatDate(date: string | Date): string {
    // Si es un objeto Date (desde el datepicker)
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    // Si ya es un string en formato correcto
    return date;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}