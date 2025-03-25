import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogActivity } from '../../../services/LogActivityService/log-activity-service.service';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './log-detail-dialog.component.html',
  styleUrls: ['./log-detail-dialog.component.css']
})
export class LogDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public log: LogActivity) {}
}