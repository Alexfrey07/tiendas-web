import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoDto {
  id: number | null;
  idCategoria: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  marca: string;
  modelo: string;
  precioVenta: number;
  costo: number;
  mesesGarantia: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/productos';

  listar(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(this.url);
  }

  guardar(p: ProductoDto): Observable<ProductoDto> {
    return p.id
      ? this.http.put<ProductoDto>(`${this.url}/${p.id}`, p)
      : this.http.post<ProductoDto>(this.url, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}