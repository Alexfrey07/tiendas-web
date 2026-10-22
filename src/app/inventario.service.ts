import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventarioFila {
  id: number;
  idSucursal: number;
  sucursal: string;
  idProducto: number;
  codigo: string;
  producto: string;
  existencia: number;
  stockMinimo: number;
  estadoStock: string;
}

export interface MovimientoFila {
  id: number;
  fecha: string;
  sucursal: string;
  producto: string;
  tipo: string;
  cantidad: number;
  origen: string | null;
  idOrigen: number | null;
  justificacion: string | null;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/inventario';

  listar(idSucursal: number | null): Observable<InventarioFila[]> {
    const q = idSucursal ? `?idSucursal=${idSucursal}` : '';
    return this.http.get<InventarioFila[]>(this.url + q);
  }

  kardex(idSucursal: number | null): Observable<MovimientoFila[]> {
    const q = idSucursal ? `?idSucursal=${idSucursal}` : '';
    return this.http.get<MovimientoFila[]>(`${this.url}/kardex${q}`);
  }

  ajustar(datos: { idSucursal: number; idProducto: number; nuevaExistencia: number; justificacion: string }): Observable<void> {
    return this.http.put<void>(`${this.url}/ajustar`, datos);
  }

  cambiarMinimo(id: number, stockMinimo: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/minimo`, { stockMinimo });
  }
}