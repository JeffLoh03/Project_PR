import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatButtonModule,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Hospital Reception System';
}