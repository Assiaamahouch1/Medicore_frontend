
import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppHeaderSecrComponent } from '../app-header-secr/app-header-secr.component';

import { AppSidebarSecrComponent } from '../app-sidebarsecr/app-sidebarsecr.component';

@Component({
  selector: 'app-app-layout-secr',
  imports: [
    CommonModule,
        RouterModule,
        AppHeaderSecrComponent,
        BackdropComponent,
        AppSidebarSecrComponent
  ],
  templateUrl: './app-layout-secr.component.html',
})
export class AppLayoutSecrComponent {
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
