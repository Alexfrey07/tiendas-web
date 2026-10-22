import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LineaCompra {
  idProducto: number;
  producto: string;
  cantidad: number;
  costoUnitario: number;
}

export interface CompraFila {
  id: number;
  numeroDocumento: string;
  proveedor: string;
  sucursal: string;
  empleado: string;
  fecha: string;
  total: number;
  estado: string;
}

export interface DetalleCompra {
  idProducto: number;
  producto: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/compras';

  listar(): Observable<CompraFila[]> {
    return this.http.get<CompraFila[]>(this.url);
  }

  detalle(id: number): Observable<DetalleCompra[]> {
    return this.http.get<DetalleCompra[]>(`${this.url}/${id}/detalle`);
  }

  crear(datos: {
    idProveedor: number;
    idSucursal: number;
    numeroDocumento: string;
    observaciones: string;
    lineas: { idProducto: number; cantidad: number; costoUnitario: number }[];
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, datos);
  }

  recibir(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/recibir`, {});
  }

  cancelar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/cancelar`, {});
  }
}