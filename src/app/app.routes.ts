import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Categorias } from './categorias/categorias';
import { Departamentos } from './departamentos/departamentos';
import { Puestos } from './puestos/puestos';
import { Proveedores } from './proveedores/proveedores';
import { Horarios } from './horarios/horarios';
import { Municipios } from './municipios/municipios';
import { Sucursales } from './sucursales/sucursales';
import { Productos } from './productos/productos';
import { Clientes } from './clientes/clientes';
import { Empleados } from './empleados/empleados';
import { Compras } from './compras/compras';
import { Facturacion } from './facturacion/facturacion';
import { NotasCredito } from './notas-credito/notas-credito';
import { ReclamosGarantia } from './reclamos-garantia/reclamos-garantia';
import { Inventario } from './inventario/inventario';
import { Reporte } from './reporte/reporte';
import { Dashboard } from './dashboard/dashboard';
import { permisoGuard } from './permiso.guard';
import { Usuarios } from './usuarios/usuarios';
import { Roles } from './roles/roles';
import { Bitacora } from './bitacora/bitacora';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'categorias', component: Categorias, canActivate: [permisoGuard] },
  { path: 'departamentos', component: Departamentos, canActivate: [permisoGuard] },
  { path: 'puestos', component: Puestos, canActivate: [permisoGuard] },
  { path: 'proveedores', component: Proveedores, canActivate: [permisoGuard] },
  { path: 'horarios', component: Horarios, canActivate: [permisoGuard] },
  { path: 'municipios', component: Municipios, canActivate: [permisoGuard] },
  { path: 'sucursales', component: Sucursales, canActivate: [permisoGuard] },
  { path: 'productos', component: Productos, canActivate: [permisoGuard] },
  { path: 'clientes', component: Clientes, canActivate: [permisoGuard] },
  { path: 'empleados', component: Empleados, canActivate: [permisoGuard] },
  { path: 'compras', component: Compras, canActivate: [permisoGuard] },
  { path: 'facturacion', component: Facturacion, canActivate: [permisoGuard] },
  { path: 'notas-credito', component: NotasCredito, canActivate: [permisoGuard] },
  { path: 'reclamos-garantia', component: ReclamosGarantia, canActivate: [permisoGuard] },
  { path: 'inventario', component: Inventario, canActivate: [permisoGuard] },
  { path: 'reportes/:tipo', component: Reporte, canActivate: [permisoGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [permisoGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [permisoGuard] },
  { path: 'roles', component: Roles, canActivate: [permisoGuard] },
  { path: 'bitacora', component: Bitacora, canActivate: [permisoGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];