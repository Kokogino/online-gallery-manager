import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DeleteConfirmationDialogComponent } from '@app/shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationDialogData } from '@app/shared/model/delete-confirmation-dialog-data';

@Injectable({
  providedIn: 'root',
})
export class SharedDialogService {
  constructor(private readonly dialog: MatDialog) {}

  public openDeleteConfirmationDialog(data: DeleteConfirmationDialogData): Observable<boolean> {
    return this.dialog.open(DeleteConfirmationDialogComponent, { width: '400px', data }).afterClosed();
  }
}
