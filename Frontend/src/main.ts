import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import localeFr from '@angular/common/locales/fr';  // Français
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeFr);  // ← Cette ligne résout l'erreur

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
