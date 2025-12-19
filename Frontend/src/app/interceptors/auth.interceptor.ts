// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYXdzc2FuYWF0aXEwMDNAZ21haWwuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJjYWJpbmV0SWQiOjMsIm5vbSI6ImFhdGlxIiwicHJlbm9tIjoic2F3c3NhbiIsImlhdCI6MTc2NjEwNDcyMywiZXhwIjoxNzY2MTA4MzIzfQ.EaUngY9Ii3liYIUOcj5MLRZWxZ7nfl221pyHVS7Zj6Vd5FVViD9kNK3OVbZHxXiqudSz-Nm83y-ZMHM3ktsSwQ';
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};