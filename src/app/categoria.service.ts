import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaDto {
  id: number | null;
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/categorias';

  listar(): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>(this.url);
  }

  guardar(c: CategoriaDto): Observable<CategoriaDto> {
    return c.id
      ? this.http.put<CategoriaDto>(`${this.url}/${c.id}`, c)
      : this.http.post<CategoriaDto>(this.url, c);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}