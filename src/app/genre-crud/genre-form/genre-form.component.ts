import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenreService } from '../../services/genre.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-genre-form',
  templateUrl: './genre-form.component.html',
  styleUrls: ['./genre-form.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class GenreFormComponent implements OnInit {
  genreForm: FormGroup; // Formulario reactivo
  isEditMode = false; // Modo edición o creación
  genreId: number | null = null; // ID del género (si está en modo edición)

  constructor(
    private fb: FormBuilder, // FormBuilder para crear el formulario
    private genreService: GenreService, // Servicio de géneros
    private route: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router, // Para navegar entre rutas
    private snackBar: MatSnackBar // Para mostrar notificaciones
  ) {
    // Inicializar el formulario
    this.genreForm = this.fb.group({
      name: ['', Validators.required], // Campo nombre (requerido)
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.genreId = this.route.snapshot.params['id'];
    if (this.genreId) {
      this.isEditMode = true;
      this.loadGenre(this.genreId); // Cargar datos del género si está en modo edición
    }
  }

  // Cargar datos del género (modo edición)
  async loadGenre(id: number): Promise<void> {
    try {
      const genre = await lastValueFrom(this.genreService.getGenre(id));
      this.genreForm.patchValue(genre); // Rellenar el formulario con los datos del género
    } catch (error) {
      this.snackBar.open('Error al cargar género', 'Cerrar', { duration: 3000 });
    }
  }

  // Enviar el formulario (crear o actualizar)
  async onSubmit(): Promise<void> {
    if (this.genreForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    const genreData = this.genreForm.value; // Obtener datos del formulario
    try {
      if (this.isEditMode && this.genreId) {
        // Modo edición: Actualizar género
        await lastValueFrom(this.genreService.updateGenre(this.genreId, genreData));
        this.snackBar.open('Género actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Modo creación: Crear género
        await lastValueFrom(this.genreService.createGenre(genreData));
        this.snackBar.open('Género creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToGenreList(); // Redirigir a la lista de géneros
    } catch (error) {
      this.snackBar.open('Error al guardar género', 'Cerrar', { duration: 3000 });
    }
  }

  // Redirigir a la lista de géneros
  navigateToGenreList(): void {
    this.router.navigate(['/genre-crud']);
  }
}