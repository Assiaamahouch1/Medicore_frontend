import { AppSidebarMedcComponent } from './../app-sidebarmedc/app-sidebarmedc.component';
import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  selector: 'app-layout-medc',
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppSidebarMedcComponent,
    BackdropComponent
  ],
  templateUrl: './app-layout-medc.component.html',
})

export class AppLayoutMedcComponent {
  readonly isExpanded$;
  readonly isHovered$;
  readonly isMobileOpen$;

  constructor(public sidebarService: SidebarService) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  get containerClasses() {
    return [
      'flex-1',
      'transition-all',
      'duration-300',
      'ease-in-out',
      (this.isExpanded$ || this.isHovered$) ? 'xl:ml-[290px]' : 'xl:ml-[90px]',
      this.isMobileOpen$ ? 'ml-0' : ''
    ];
  }

}
