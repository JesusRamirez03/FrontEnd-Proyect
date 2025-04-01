import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudioService } from '../../../services/studio/studio.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-studio-form',
  templateUrl: './studio-form.component.html',
  styleUrls: ['./studio-form.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule
  ],
})
export class StudioFormComponent implements OnInit {
  studioForm: FormGroup; // Formulario reactivo
  isEditMode = false; // Modo edición o creación
  studioId: number | null = null; // ID del estudio (si está en modo edición)

  constructor(
    private fb: FormBuilder, // FormBuilder para crear el formulario
    private studioService: StudioService, // Servicio de estudios
    private route: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router, // Para navegar entre rutas
    private snackBar: MatSnackBar // Para mostrar notificaciones
  ) {
    // Inicializar el formulario
    this.studioForm = this.fb.group({
      name: ['', Validators.required], // Campo nombre (requerido)
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.studioId = this.route.snapshot.params['id'];
    if (this.studioId) {
      this.isEditMode = true;
      this.loadStudio(this.studioId); // Cargar datos del estudio si está en modo edición
    }
  }

  // Cargar datos del estudio (modo edición)
  async loadStudio(id: number): Promise<void> {
    try {
      const studio = await lastValueFrom(this.studioService.getStudio(id));
      this.studioForm.patchValue(studio); // Rellenar el formulario con los datos del estudio
    } catch (error) {
      this.snackBar.open('Error al cargar estudio', 'Cerrar', { duration: 3000 });
    }
  }

  // Enviar el formulario (crear o actualizar)
  async onSubmit(): Promise<void> {
    if (this.studioForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    const studioData = this.studioForm.value; // Obtener datos del formulario
    try {
      if (this.isEditMode && this.studioId) {
        // Modo edición: Actualizar estudio
        await lastValueFrom(this.studioService.updateStudio(this.studioId, studioData));
        this.snackBar.open('Estudio actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Modo creación: Crear estudio
        await lastValueFrom(this.studioService.createStudio(studioData));
        this.snackBar.open('Estudio creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToStudioList(); // Redirigir a la lista de estudios
    } catch (error) {
      this.snackBar.open('Error al guardar estudio', 'Cerrar', { duration: 3000 });
    }
  }

  // Redirigir a la lista de estudios
  navigateToStudioList(): void {
    this.router.navigate(['/studios']);
  }
}