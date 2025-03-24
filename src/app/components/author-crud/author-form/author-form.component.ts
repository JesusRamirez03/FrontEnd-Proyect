import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorService } from '../../../services/author/author.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-author-form',
  templateUrl: './author-form.component.html',
  styleUrls: ['./author-form.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class AuthorFormComponent implements OnInit {
  authorForm: FormGroup;
  isEditMode = false;
  authorId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    private router: Router, // Mantenemos router como privado
    private snackBar: MatSnackBar
  ) {
    this.authorForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.authorId = this.route.snapshot.params['id'];
    if (this.authorId) {
      this.isEditMode = true;
      this.loadAuthor(this.authorId);
    }
  }

  async loadAuthor(id: number): Promise<void> {
    try {
      const author = await lastValueFrom(this.authorService.getAuthor(id));
      this.authorForm.patchValue(author);
    } catch (error) {
      this.snackBar.open('Error al cargar autor', 'Cerrar', { duration: 3000 });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.authorForm.invalid) {
      return;
    }

    const authorData = this.authorForm.value;
    try {
      if (this.isEditMode && this.authorId) {
        await lastValueFrom(this.authorService.updateAuthor(this.authorId, authorData));
        this.snackBar.open('Autor actualizado', 'Cerrar', { duration: 3000 });
      } else {
        await lastValueFrom(this.authorService.createAuthor(authorData));
        this.snackBar.open('Autor creado', 'Cerrar', { duration: 3000 });
      }
      this.navigateToAuthorList();
    } catch (error) {
      this.snackBar.open('Error al guardar autor', 'Cerrar', { duration: 3000 });
    }
  }

  navigateToAuthorList(): void {
    this.router.navigate(['/authors']);
  }
}