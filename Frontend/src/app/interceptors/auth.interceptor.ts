// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYXdzc2FuYWF0aXEwMDNAZ21haWwuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJjYWJpbmV0SWQiOjMsIm5vbSI6IkFhdGlxIiwicHJlbm9tIjoiU2F3c3NhbiIsImlhdCI6MTc2NjUyNjgxMCwiZXhwIjoxNzY2NTMwNDEwfQ.UIJBdvlBP3lZoG-yx-nz2f7wghkHwapvCt0J61fqQzrJc6hIgxyA6nRZHMSmalS1zP11YKtXlFYxqRkr8OJs8A';
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};