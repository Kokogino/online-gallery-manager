import { Component } from '@angular/core';
import { TagsListComponent } from '@app/admin/components/tags-list/tags-list.component';

@Component({
  selector: 'ogm-admin',
  standalone: true,
  imports: [TagsListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {}
