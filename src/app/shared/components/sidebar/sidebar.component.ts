import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly navClick = output<void>();

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/trade',     label: 'Trade',     icon: 'trending-up' },
    { path: '/history',   label: 'History',   icon: 'clock' },
    { path: '/learn',     label: 'Learn',     icon: 'book' },
  ];
}
