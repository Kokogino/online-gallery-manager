import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { DeleteConfirmationDialogData } from '@app/shared/model/delete-confirmation-dialog-data';

@Component({
  selector: 'ogm-delete-confirmation-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.scss',
})
export class DeleteConfirmationDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: DeleteConfirmationDialogData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close(true);
  }
}
