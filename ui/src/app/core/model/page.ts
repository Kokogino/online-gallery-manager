export interface Page {
  route: string;
  text: string;
  icon: string;
}

export const PAGES: ReadonlyArray<Page> = [
  {
    route: 'images',
    text: 'Images',
    icon: 'photo_library',
  },
  {
    route: 'galleries',
    text: 'Galleries',
    icon: 'folder_copy',
  },
  {
    route: 'upload',
    text: 'Upload',
    icon: 'upload',
  },
  {
    route: 'admin',
    text: 'Admin',
    icon: 'admin_panel_settings',
  },
] as const;
