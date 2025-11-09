import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HorizontalMetaPrincipalComponent } from "../horizontal/horizontal-meta-principal/horizontal-meta-principal.component";
import { SostenimientoMetaPrincipalComponent } from "../sostenimiento/sostenimiento-meta-principal/sostenimiento-meta-principal.component";
import { LargoMetaPrincipalComponent } from "../largo/largo-meta-principal/largo-meta-principal.component";

@Component({
  selector: 'app-metas',
  imports: [CommonModule, HorizontalMetaPrincipalComponent, SostenimientoMetaPrincipalComponent, LargoMetaPrincipalComponent],
  templateUrl: './metas.component.html',
  styleUrl: './metas.component.css'
})
export class MetasComponent {
  selectedComponent: string = 'horizontal'; 

  selectComponent(componentName: string) {
    this.selectedComponent = componentName;
  }
}
