// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYXdzc2FuYWF0aXEwMDNAZ21haWwuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJjYWJpbmV0SWQiOjMsIm5vbSI6IkFhdGlxIiwicHJlbm9tIjoiU2F3c3NhbiIsImlhdCI6MTc2NjEwODUwMiwiZXhwIjoxNzY2MTEyMTAyfQ.peDrYEyw69k2kN4U4Hd2FXgvnFI4XbUox1ZAZj4BmjCsPdqhWcAlb4wfvOeByUAn4-KKIkvgoaBJzsgbLAyVWg';
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};