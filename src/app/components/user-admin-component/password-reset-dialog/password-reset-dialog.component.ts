import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatInputModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Restablecer contraseña</h2>
    <mat-dialog-content>
      <p>¿Deseas restablecer la contraseña de {{ data.userName }}?</p>
      <p>Se generará una nueva contraseña aleatoria y se enviará por correo.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-button color="primary" [mat-dialog-close]="true" cdkFocusInitial>Confirmar</button>
    </mat-dialog-actions>
  `,
})
export class PasswordResetDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}