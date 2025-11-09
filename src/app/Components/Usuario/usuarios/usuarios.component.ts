import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as XLSX from 'xlsx';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { OperacionesDialogComponent } from '../operaciones-dialog.component';
import { EditarOperacionesDialogComponent } from '../editar-operaciones-dialog/editar-operaciones-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = [
    'codigo_dni',
    'nombre',
    'rol',
    'operaciones',
    'acciones',
  ];
  Object = Object;
  dataSource = new MatTableDataSource<Usuario>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe((data) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  abrirDialogoCrear() {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  obtenerPrimerasOperaciones(operaciones: {
    [clave: string]: boolean;
  }): string[] {
    return Object.keys(operaciones)
      .filter((k) => operaciones[k])
      .slice(0, 2);
  }

  abrirDialogoOperaciones(operaciones: { [clave: string]: boolean }) {
    this.dialog.open(OperacionesDialogComponent, {
      width: '400px',
      data: Object.keys(operaciones).filter((k) => operaciones[k]),
    });
  }

  abrirDialogoEditar(usuario: Usuario) {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: usuario,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => {
        this.obtenerUsuarios();
      });
    }
  }

  aplicarFiltro(event: Event) {
    const valorFiltro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valorFiltro.trim().toLowerCase();
  }

  seleccionarArchivo() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      // console.error("No se encontró el elemento de entrada de archivo.");
    }
  }

  cargarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      const reader = new FileReader();
      reader.readAsArrayBuffer(archivo);

      reader.onload = () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = 'Usuarios';
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          alert("No se encontró la hoja 'Usuarios' en el archivo.");
          return;
        }

        const datosExcel: any[] = XLSX.utils.sheet_to_json(sheet);

        let usuariosValidos: Usuario[] = [];
        let usuariosInvalidos: { nombre: string; dni: string }[] = [];

        datosExcel.forEach((row) => {
          const apellidos = row['APELLIDOS'];
          const nombres = row['NOMBRES'];
          const codigo_dni = row['DNI'];
          const cargo = row['PUESTO ACTUAL QUE DESEMPEÑA'];
          const rol = row['ROL'] || 'Trabajador';
          const area = row['ÁREA'];
          const clasificacion = row['CLASIFICACIÓN'];
          const empresa = row['EMPRESA']; // suponiendo que exista en el Excel
          const guardia = row['GUARDIA']; // idem
          const autorizado_equipo = row['AUTORIZADO EQUIPO']; // idem
          const correo = row['CORREO']; // idem
          const password = row['password'];
          const firma = row['FIRMA']; // idem
          const operacionesString = row['OPERACIONES AUTORIZADAS'] || '';

          if (
            !apellidos ||
            !nombres ||
            !codigo_dni ||
            !cargo ||
            !area ||
            !rol ||
            !clasificacion ||
            !password
          ) {
            usuariosInvalidos.push({
              nombre: nombres || 'Desconocido',
              dni: codigo_dni || 'Sin DNI',
            });
            return;
          }

          // Convertir operacionesString en objeto operaciones_autorizadas
          const operacionesArray = operacionesString
            .split(/[,;]+/)
            .map((op: string) => op.trim())
            .filter((op: string) => op.length > 0);

          const operaciones_autorizadas: { [clave: string]: boolean } = {};
          operacionesArray.forEach((op: string) => {
            operaciones_autorizadas[op] = true;
          });

          // Crear objeto Usuario con todos los campos (los opcionales sólo si tienen valor)
          const usuario: Usuario = {
            apellidos,
            nombres,
            codigo_dni,
            cargo,
            rol,
            area,
            clasificacion,
            password,
            operaciones_autorizadas,
          };

          // Añadir campos opcionales solo si existen para no enviar undefined
          if (empresa) usuario.empresa = empresa;
          if (guardia) usuario.guardia = guardia;
          if (autorizado_equipo) usuario.autorizado_equipo = autorizado_equipo;
          if (correo) usuario.correo = correo;
          if (firma) usuario.firma = firma;

          // Ahora puedes enviar o acumular el objeto usuario
          usuariosValidos.push(usuario);
        });

        if (usuariosValidos.length > 0) {
          this.enviarUsuarios(usuariosValidos, usuariosInvalidos);
        } else {
          alert('No hay usuarios válidos para enviar.');
        }
      };
    }
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
  }

enviarUsuarios(
  usuarios: Usuario[],
  usuariosInvalidos: { nombre: string; dni: string }[]
) {
  let totalUsuarios = usuarios.length;
  let usuariosProcesados = 0;
  let errores: { nombre: string; dni: string; motivo?: string }[] = [];

  const dialogRef = this.dialog.open(LoadingDialogComponent, {
    disableClose: true,
  });

  // Si no hay usuarios para procesar, cierra inmediato
  if (totalUsuarios === 0) {
    dialogRef.close();
    this.mostrarErrores(usuariosInvalidos);
    return;
  }

  const subscriptions: Subscription[] = [];

  usuarios.forEach((usuario) => {
    const sub = this.usuarioService.crearUsuario(usuario).subscribe({
      next: () => {
        usuariosProcesados++;
        this.verificarCompletado(
          usuariosProcesados,
          totalUsuarios,
          dialogRef,
          usuariosInvalidos,
          errores
        );
      },
      error: (error) => {
        errores.push({
          nombre: usuario.nombres || 'Desconocido',
          dni: usuario.codigo_dni || 'Sin DNI',
          motivo: error.message || 'Error al crear usuario'
        });
        usuariosProcesados++;
        this.verificarCompletado(
          usuariosProcesados,
          totalUsuarios,
          dialogRef,
          usuariosInvalidos,
          errores
        );
      }
    });
    subscriptions.push(sub);
  });

  // Para manejar la desuscripción si el componente se destruye
  return () => subscriptions.forEach(sub => sub.unsubscribe());
}

private verificarCompletado(
  procesados: number,
  total: number,
  dialogRef: MatDialogRef<LoadingDialogComponent>,
  usuariosInvalidos: { nombre: string; dni: string }[],
  errores: { nombre: string; dni: string; motivo?: string }[]
) {
  if (procesados === total) {
    dialogRef.close();
    // Combina usuarios inválidos del Excel con errores de la API
    const todosErrores = [...usuariosInvalidos, ...errores];
    if (todosErrores.length > 0) {
      this.mostrarErrores(todosErrores);
    }
    // Actualiza la lista de usuarios
    this.obtenerUsuarios();
  }
}

  mostrarErrores(
    usuariosInvalidos: { nombre: string; dni: string; motivo?: string }[]
  ) {
    if (usuariosInvalidos.length > 0) {
      let mensaje = 'Errores en el registro:\n\n';
      usuariosInvalidos.forEach((usuario) => {
        mensaje += `• ${usuario.nombre} (DNI: ${usuario.dni}): ${
          usuario.motivo || 'Datos incompletos'
        }\n`;
      });
      alert(mensaje);
    }
  }

  abrirDialogoEdicion(
    usuarioId: number,
    operacionesAutorizadas: { [key: string]: boolean }
  ) {
    const dialogRef = this.dialog.open(EditarOperacionesDialogComponent, {
      width: '400px',
      data: {
        id: usuarioId,
        operacionesAutorizadas: operacionesAutorizadas,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        // ✅ Aquí llamas a la función que actualiza la tabla
        this.obtenerUsuarios(); // o como se llame tu función de recarga
      }
    });
  }
}
