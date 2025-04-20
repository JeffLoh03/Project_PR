import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent implements OnInit {
  @Input() sidebarOpen: boolean = false;

  constructor(public router: Router) { }

  ngOnInit(): void {
    console.log('Sidebar component initialized');
  }

  // Methods for the bottom buttons
  onSettingsClick(): void {
    console.log('Settings button clicked');
  }

  onLogoutClick(): void {
    console.log('Logout button clicked');
  }

  // Method to toggle sidebar state
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggle state:', this.sidebarOpen);
  }
}
