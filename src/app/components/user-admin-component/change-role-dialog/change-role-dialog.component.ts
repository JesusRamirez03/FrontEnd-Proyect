// change-role-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatSelectModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Cambiar rol de {{ data.userName }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Seleccionar rol</mat-label>
        <mat-select [(ngModel)]="selectedRole">
          <mat-option value="admin">Administrador</mat-option>
          <mat-option value="user">Usuario</mat-option>
          <mat-option value="guest">Invitado</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-button color="primary" [mat-dialog-close]="selectedRole" cdkFocusInitial>Confirmar</button>
    </mat-dialog-actions>
  `,
})
export class ChangeRoleDialogComponent {
  selectedRole: string;

  constructor(
    public dialogRef: MatDialogRef<ChangeRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentRole: string, userName: string }
  ) {
    this.selectedRole = data.currentRole;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}