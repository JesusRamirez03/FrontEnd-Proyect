import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile/profile.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-name',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-name.component.html',
  styleUrls: ['./edit-name.component.css']
})
export class EditNameComponent implements OnInit {
  nameForm: FormGroup;
  isLoading = false;
  currentName: string = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.nameForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentName();
  }

  loadCurrentName(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.currentName = profile.name;
        this.nameForm.patchValue({ name: profile.name });
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  updateName(): void {
    if (this.nameForm.invalid) return;

    this.isLoading = true;
    this.profileService.updateName(this.nameForm.value.name).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Nombre actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error al actualizar el nombre', 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}