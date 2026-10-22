import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotaFila {
  id: number;
  serie: string;
  numero: number;
  fecha: string;
  factura: string;
  cliente: string;
  total: number;
  motivo: string;
  empleado: string;
}

export interface LineaOriginal {
  idDetalleFactura: number;
  producto: string;
  facturada: number;
  precio: number;
  devuelta: number;
}

export interface LineaNC extends LineaOriginal {
  devolver: number;
  reingresa: string;
}

export interface DetalleNota {
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  reingresa: string;
}

@Injectable({ providedIn: 'root' })
export class NotaCreditoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/notas-credito';

  listar(): Observable<NotaFila[]> {
    return this.http.get<NotaFila[]>(this.url);
  }

  detalle(id: number): Observable<DetalleNota[]> {
    return this.http.get<DetalleNota[]>(`${this.url}/${id}/detalle`);
  }

  lineas(idFactura: number): Observable<LineaOriginal[]> {
    return this.http.get<LineaOriginal[]>(`${this.url}/factura/${idFactura}/lineas`);
  }

  crear(datos: {
    idFactura: number;
    motivo: string;
    lineas: { idDetalleFactura: number; cantidad: number; reingresa: string }[];
  }): Observable<{ id: number; serie: string; numero: number; total: number }> {
    return this.http.post<{ id: number; serie: string; numero: number; total: number }>(this.url, datos);
  }
}