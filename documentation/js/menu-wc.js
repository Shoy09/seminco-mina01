'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">I-MINER documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BarrasMetroPerforadosLaborComponent.html" data-type="entity-link" >BarrasMetroPerforadosLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" >ConfirmDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CrearDataComponent.html" data-type="entity-link" >CrearDataComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CreatePlanAvanceComponent.html" data-type="entity-link" >CreatePlanAvanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CreatePlanMetrajeComponent.html" data-type="entity-link" >CreatePlanMetrajeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CreatePlanProduccionComponent.html" data-type="entity-link" >CreatePlanProduccionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEditMetaComponent.html" data-type="entity-link" >DialogEditMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEditMetaComponent-1.html" data-type="entity-link" >DialogEditMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEditMetaComponent-2.html" data-type="entity-link" >DialogEditMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogMetaComponent.html" data-type="entity-link" >DialogMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogMetaComponent-1.html" data-type="entity-link" >DialogMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogMetaComponent-2.html" data-type="entity-link" >DialogMetaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaEquipoComponent.html" data-type="entity-link" >DisponibilidadMecanicaEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaEquipoComponent-1.html" data-type="entity-link" >DisponibilidadMecanicaEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaEquipoComponent-2.html" data-type="entity-link" >DisponibilidadMecanicaEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaGeneralComponent.html" data-type="entity-link" >DisponibilidadMecanicaGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaGeneralComponent-1.html" data-type="entity-link" >DisponibilidadMecanicaGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DisponibilidadMecanicaGeneralComponent-2.html" data-type="entity-link" >DisponibilidadMecanicaGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditarOperacionesDialogComponent.html" data-type="entity-link" >EditarOperacionesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditPlanAvanceComponent.html" data-type="entity-link" >EditPlanAvanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditPlanMetrajeComponent.html" data-type="entity-link" >EditPlanMetrajeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditPlanProduccionComponent.html" data-type="entity-link" >EditPlanProduccionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EstadoFormComponent.html" data-type="entity-link" >EstadoFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EstadoFormEditarComponent.html" data-type="entity-link" >EstadoFormEditarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EstadosComponent.html" data-type="entity-link" >EstadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ExplosivosComponent.html" data-type="entity-link" >ExplosivosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoBarrasAgrupadaComponent.html" data-type="entity-link" >GraficoBarrasAgrupadaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoBarrasAgrupadaNumLaborComponent.html" data-type="entity-link" >GraficoBarrasAgrupadaNumLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoBarrasComponent.html" data-type="entity-link" >GraficoBarrasComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoBarrasMetrosLaborComponent.html" data-type="entity-link" >GraficoBarrasMetrosLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoEstadosComponent.html" data-type="entity-link" >GraficoEstadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoEstadosComponent-1.html" data-type="entity-link" >GraficoEstadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoEstadosComponent-2.html" data-type="entity-link" >GraficoEstadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoHorometrosComponent.html" data-type="entity-link" >GraficoHorometrosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HorizontalMetaPrincipalComponent.html" data-type="entity-link" >HorizontalMetaPrincipalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HorometrosComponent.html" data-type="entity-link" >HorometrosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HorometrosComponent-1.html" data-type="entity-link" >HorometrosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LargoMetaPrincipalComponent.html" data-type="entity-link" >LargoMetaPrincipalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingDialogComponent.html" data-type="entity-link" >LoadingDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LongitudDePerforacionComponent.html" data-type="entity-link" >LongitudDePerforacionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MallaInstaladaEquipoComponent.html" data-type="entity-link" >MallaInstaladaEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MallaInstaladaLaborComponent.html" data-type="entity-link" >MallaInstaladaLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuComponent.html" data-type="entity-link" >MenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetasComponent.html" data-type="entity-link" >MetasComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetrosPerforadosEquipoComponent.html" data-type="entity-link" >MetrosPerforadosEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetrosPerforadosEquipoComponent-1.html" data-type="entity-link" >MetrosPerforadosEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetrosPerforadosLaborComponent.html" data-type="entity-link" >MetrosPerforadosLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetrosPerforadosLaborComponent-1.html" data-type="entity-link" >MetrosPerforadosLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MostrarGraficosComponent.html" data-type="entity-link" >MostrarGraficosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OpcionesDialogComponent.html" data-type="entity-link" >OpcionesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OperacionesDialogComponent.html" data-type="entity-link" >OperacionesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanDetallesDialogComponent.html" data-type="entity-link" >PlanDetallesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanMensualListComponent.html" data-type="entity-link" >PlanMensualListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanMetrajeDetallesDialogComponent.html" data-type="entity-link" >PlanMetrajeDetallesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanMetrajeListComponent.html" data-type="entity-link" >PlanMetrajeListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanProduccionDetallesDialogComponent.html" data-type="entity-link" >PlanProduccionDetallesDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlanProduccionListComponent.html" data-type="entity-link" >PlanProduccionListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrincipalComponent.html" data-type="entity-link" >PrincipalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioDeEstadosGeneralComponent.html" data-type="entity-link" >PromedioDeEstadosGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioDeEstadosGeneralComponent-1.html" data-type="entity-link" >PromedioDeEstadosGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioDeEstadosGeneralComponent-2.html" data-type="entity-link" >PromedioDeEstadosGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioMayasComponent.html" data-type="entity-link" >PromedioMayasComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioNTaladroComponent.html" data-type="entity-link" >PromedioNTaladroComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromedioTaladrosComponent.html" data-type="entity-link" >PromedioTaladrosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromMetrosPerforadosSeccionComponent.html" data-type="entity-link" >PromMetrosPerforadosSeccionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromNumTaladroSeccionComponent.html" data-type="entity-link" >PromNumTaladroSeccionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromNumTaladroTipoLaborComponent.html" data-type="entity-link" >PromNumTaladroTipoLaborComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoDePerforacionesComponent.html" data-type="entity-link" >RendimientoDePerforacionesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoDePerforacionesComponent-1.html" data-type="entity-link" >RendimientoDePerforacionesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoDePerforacionesComponent-2.html" data-type="entity-link" >RendimientoDePerforacionesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoPromedioComponent.html" data-type="entity-link" >RendimientoPromedioComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoPromedioComponent-1.html" data-type="entity-link" >RendimientoPromedioComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RendimientoPromedioComponent-2.html" data-type="entity-link" >RendimientoPromedioComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SeleccionProcesoEstatosDialogComponent.html" data-type="entity-link" >SeleccionProcesoEstatosDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SostenimientoGraficosComponent.html" data-type="entity-link" >SostenimientoGraficosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SostenimientoMetaPrincipalComponent.html" data-type="entity-link" >SostenimientoMetaPrincipalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SumaMetrosPerforadosComponent.html" data-type="entity-link" >SumaMetrosPerforadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SumaMetrosPerforadosComponent-1.html" data-type="entity-link" >SumaMetrosPerforadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SumaMetrosPerforadosComponent-2.html" data-type="entity-link" >SumaMetrosPerforadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SumaMetrosPerforadosComponent-3.html" data-type="entity-link" >SumaMetrosPerforadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TaladroHorizontalGraficaComponent.html" data-type="entity-link" >TaladroHorizontalGraficaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TaladroLargoGraficaComponent.html" data-type="entity-link" >TaladroLargoGraficaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioComponent.html" data-type="entity-link" >UsuarioComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioDialogComponent.html" data-type="entity-link" >UsuarioDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuariosComponent.html" data-type="entity-link" >UsuariosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionEquipoComponent.html" data-type="entity-link" >UtilizacionEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionEquipoComponent-1.html" data-type="entity-link" >UtilizacionEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionEquipoComponent-2.html" data-type="entity-link" >UtilizacionEquipoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionGeneralComponent.html" data-type="entity-link" >UtilizacionGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionGeneralComponent-1.html" data-type="entity-link" >UtilizacionGeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UtilizacionGeneralComponent-2.html" data-type="entity-link" >UtilizacionGeneralComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AccesorioService.html" data-type="entity-link" >AccesorioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link" >ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DestinatarioCorreoService.html" data-type="entity-link" >DestinatarioCorreoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmpresaService.html" data-type="entity-link" >EmpresaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EquipoService.html" data-type="entity-link" >EquipoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EstadoService.html" data-type="entity-link" >EstadoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExplosivoService.html" data-type="entity-link" >ExplosivoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExplosivosUniService.html" data-type="entity-link" >ExplosivosUniService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FechasPlanMensualService.html" data-type="entity-link" >FechasPlanMensualService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetaLargoService.html" data-type="entity-link" >MetaLargoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetaService.html" data-type="entity-link" >MetaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetaSostenimientoService.html" data-type="entity-link" >MetaSostenimientoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OperacionService.html" data-type="entity-link" >OperacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlanMensualService.html" data-type="entity-link" >PlanMensualService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlanMetrajeService.html" data-type="entity-link" >PlanMetrajeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlanProduccionService.html" data-type="entity-link" >PlanProduccionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TipoPerforacionService.html" data-type="entity-link" >TipoPerforacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsuarioService.html" data-type="entity-link" >UsuarioService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/AuthInterceptor.html" data-type="entity-link" >AuthInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Accesorio.html" data-type="entity-link" >Accesorio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DestinatarioCorreo.html" data-type="entity-link" >DestinatarioCorreo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Empresa.html" data-type="entity-link" >Empresa</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Equipo.html" data-type="entity-link" >Equipo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estado.html" data-type="entity-link" >Estado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estado2.html" data-type="entity-link" >Estado2</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Explosivo.html" data-type="entity-link" >Explosivo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplosivosUni.html" data-type="entity-link" >ExplosivosUni</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FechasPlanMensual.html" data-type="entity-link" >FechasPlanMensual</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Meta.html" data-type="entity-link" >Meta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeEstado.html" data-type="entity-link" >NubeEstado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeHorometros.html" data-type="entity-link" >NubeHorometros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeInterPerforacionHorizontal.html" data-type="entity-link" >NubeInterPerforacionHorizontal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeInterPerforacionTaladroLargo.html" data-type="entity-link" >NubeInterPerforacionTaladroLargo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeInterSostenimiento.html" data-type="entity-link" >NubeInterSostenimiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeOperacion.html" data-type="entity-link" >NubeOperacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubePerforacionHorizontal.html" data-type="entity-link" >NubePerforacionHorizontal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubePerforacionTaladroLargo.html" data-type="entity-link" >NubePerforacionTaladroLargo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NubeSostenimiento.html" data-type="entity-link" >NubeSostenimiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlanMensual.html" data-type="entity-link" >PlanMensual</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlanMetraje.html" data-type="entity-link" >PlanMetraje</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlanProduccion.html" data-type="entity-link" >PlanProduccion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TipoPerforacion.html" data-type="entity-link" >TipoPerforacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuario.html" data-type="entity-link" >Usuario</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});