import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacturaFila {
  id: number;
  serie: string;
  numero: number;
  fecha: string;
  cliente: string;
  sucursal: string;
  empleado: string;
  total: number;
}

export interface ProductoDisponible {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  existencia: number;
}

export interface TipoPago {
  id: number;
  nombre: string;
}

export interface LineaFactura {
  idProducto: number;
  codigo: string;
  producto: string;
  cantidad: number;
  precio: number;
  existencia: number;
}

export interface PagoFactura {
  idTipoPago: number;
  tipoPago: string;
  monto: number;
  referencia: string;
}

export interface DetalleFactura {
  lineas: { producto: string; cantidad: number; precio: number; subtotal: number }[];
  pagos: { tipoPago: string; monto: number; referencia: string }[];
}

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/facturas';

  listar(): Observable<FacturaFila[]> {
    return this.http.get<FacturaFila[]>(this.url);
  }

  detalle(id: number): Observable<DetalleFactura> {
    return this.http.get<DetalleFactura>(`${this.url}/${id}/detalle`);
  }

  productos(idSucursal: number): Observable<ProductoDisponible[]> {
    return this.http.get<ProductoDisponible[]>(`${this.url}/productos?idSucursal=${idSucursal}`);
  }

  tiposPago(): Observable<TipoPago[]> {
    return this.http.get<TipoPago[]>(`${this.url}/tipos-pago`);
  }

  crear(datos: {
    idCliente: number;
    idSucursal: number;
    lineas: { idProducto: number; cantidad: number }[];
    pagos: { idTipoPago: number; monto: number; referencia: string }[];
  }): Observable<{ id: number; serie: string; numero: number; total: number }> {
    return this.http.post<{ id: number; serie: string; numero: number; total: number }>(this.url, datos);
  }
}