import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService, ProductoDto } from '../producto.service';
import { CategoriaService, CategoriaDto } from '../categoria.service';

@Component({
  selector: 'app-productos',
  imports: [FormsModule],
  templateUrl: './productos.html'
})
export class Productos {
  private servicio = inject(ProductoService);
  private servicioCat = inject(CategoriaService);
  lista = signal<ProductoDto[]>([]);
  categorias = signal<CategoriaDto[]>([]);
  mensaje = signal('');
  form: ProductoDto = this.nuevo();

  constructor() {
    this.servicioCat.listar().subscribe({
      next: datos => this.categorias.set(datos),
      error: () => this.mensaje.set('No se pudieron cargar las categorías')
    });
    this.cargar();
  }

  nuevo(): ProductoDto {
    return {
      id: null, idCategoria: null, codigo: '', nombre: '', descripcion: '',
      marca: '', modelo: '', precioVenta: 0, costo: 0, mesesGarantia: 0, estado: 'ACTIVO'
    };
  }

  nombreCategoria(id: number | null): string {
    return this.categorias().find(c => c.id === id)?.nombre ?? '';
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.idCategoria || !this.form.codigo.trim() || !this.form.nombre.trim()) {
      this.mensaje.set('La categoría, el código y el nombre son obligatorios');
      return;
    }
    if (this.form.precioVenta < 0 || this.form.costo < 0 || this.form.mesesGarantia < 0) {
      this.mensaje.set('El precio, el costo y los meses de garantía no pueden ser negativos');
      return;
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el código puede estar repetido)')
    });
  }

  editar(p: ProductoDto) {
    this.form = { ...p };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(p: ProductoDto) {
    if (!confirm('¿Eliminar el producto ' + p.nombre + '?')) return;
    this.servicio.eliminar(p.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene inventario, compras o ventas)')
    });
  }
}