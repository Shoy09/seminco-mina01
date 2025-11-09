import { Component } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-principal',
  imports: [MenuComponent, RouterModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {

}
