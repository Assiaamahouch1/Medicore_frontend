// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYXdzc2FuYWF0aXEwMDNAZ21haWwuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJjYWJpbmV0SWQiOjMsIm5vbSI6ImFhdGlxIiwicHJlbm9tIjoic2F3c3NhbiIsImlhdCI6MTc2NjAyNTQ5NCwiZXhwIjoxNzY2MDI5MDk0fQ.dzavScnx1CU6Y-eO0U-Bhz1WDu1QrPP9E5ofWetcd5vb9_3IviWETd_IDXQCEa8nd7WJbImZ7lRFt3dYfzkdng';
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};