import { Component, OnInit, HostListener } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  sidebarOpen = false;
  isDark = true;

  constructor(
   
  ) {}

  ngOnInit(): void {
  }

 
}
