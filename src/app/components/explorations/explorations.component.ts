/*
 * RIHANA Frontend
 *
 * Copyright (C) 2021 David A. Ruano Ordás, José Ramón Méndez Reboredo,
 * Miguel Ferreiro Díaz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 */

import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {AuthenticationService} from '../../services/authentication.service';
import {ExplorationsService} from '../../services/explorations.service';
import {SignTypesService} from '../../services/sign-types.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {Exploration} from '../../models/Exploration';
import {Sign} from '../../models/Sign';
import {SignType} from '../../models/SignType';
import {Role} from '../../models/User';

@Component({
	selector: 'app-explorations',
	templateUrl: './explorations.component.html',
	styleUrls: ['./explorations.component.css']
})
export class ExplorationsComponent implements OnInit, AfterViewChecked {

	private readonly formatDate: string = 'DD/MM/yyyy_HH:mm:ss';
	private _currentPage: number;

	public loggedUser: string;

	public signTypes: SignType[];
	public signTypesFilter: SignType[] = [];

	public explorations: Exploration[] = [];
	public exploration: Exploration = new Exploration();

	public paginationTotalItems: number;
	public pageSize: number;
	public pageChangeEvent = new Subject<string>();
	public lastPage: number;

	public deletingExploration: boolean = false;
	public recoveringExploration: boolean = false;

	public updateChart: Subject<void> = new Subject<void>();

	public initialDate;
	public finalDate;
	public options: any = {
		autoApply: false,
		alwaysShowCalendars: true,
		applyButtonClasses: "btn-primary applyDate",
		buttonClasses: "btn btn-sm",
		cancelClass: "btn-default cancelDate",
		drops: "up",
		locale: {
			format: 'DD/MM/yyyy',
			daysOfWeek: [
				this.locationService.translate("Sunday").substr(0, 2),
				this.locationService.translate("Monday").substr(0, 2),
				this.locationService.translate("Tuesday").substr(0, 2),
				this.locationService.translate("Wednesday").substr(0, 2),
				this.locationService.translate("Thursday").substr(0, 2),
				this.locationService.translate("Friday").substr(0, 2),
				this.locationService.translate("Saturday").substr(0, 2)
			],
			monthNames: [
				this.locationService.translate("January"),
				this.locationService.translate("February"),
				this.locationService.translate("March"),
				this.locationService.translate("April"),
				this.locationService.translate("May"),
				this.locationService.translate("June"),
				this.locationService.translate("July"),
				this.locationService.translate("August"),
				this.locationService.translate("September"),
				this.locationService.translate("October"),
				this.locationService.translate("November"),
				this.locationService.translate("December")
			],
			"firstDay": 1
		},
		minDate: '01/01/2021',
		maxDate: new Date(),
		opens: 'left',
		showDropdowns: true,
		timePicker: false
	};

	constructor(private authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private locationService: LocalizationService,
				private explorationsService: ExplorationsService,
				private signTypesService: SignTypesService,
				private router: Router) { }

	ngOnInit() {
		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}

		this.pageSize = 6;
		this.currentPage = 1;
		this.initialDate = undefined;
		this.finalDate = undefined;
		this.getSignTypes();
		this.getPageExplorations();
		this.explorationsService.setExplorationId(undefined);
	}

	ngAfterViewChecked() {
		if (this.explorationsService.getExplorationCreated()) {
			this.notificationService.success('Exploration registered successfully', 'Exploration registered')
			this.explorationsService.setExplorationCreated(false);
		}

		if (this.explorationsService.getExplorationEdited()) {
			this.notificationService.success('Exploration edited successfully', 'Exploration edited')
			this.explorationsService.setExplorationEdited(false);
		}
		document.getElementsByClassName("applyDate")[0].textContent = this.locationService.translate("Apply");
		document.getElementsByClassName("cancelDate")[0].textContent = this.locationService.translate("Cancel");
	}

	private getSignTypes() {
		this.signTypesService.getSignTypes().subscribe(signTypes =>
			this.signTypes = signTypes
		)
	}

	getPageExplorations() {
		let initialDate: Date = undefined;
		let finalDate: Date = undefined;
		if (this.initialDate != undefined) initialDate = this.initialDate.format(this.formatDate)
		if (this.finalDate != undefined) finalDate = this.finalDate.format(this.formatDate)

		this.explorationsService.getTotalExplorations(this.loggedUser, this.currentPage, this.pageSize,
			this.signTypesFilter, false, initialDate, finalDate).subscribe(explorationPage => {
			this.paginationTotalItems = explorationPage.totalItems;
			this.lastPage = Math.ceil(this.paginationTotalItems / this.pageSize);
			this.explorations = explorationPage.explorations;
		});
	}

	public getExplorationSigns(exploration: Exploration): Sign[] {
		return [...new Map(this.explorationSigns(exploration).map(item => [item.type.code, item])).values()];
	}

	public getNumExplorationSignType(exploration: Exploration, code: string): number {
		return this.explorationSigns(exploration).filter(sign => sign.type.code == code).length;
	}

	public getRadiographType(exploration: Exploration): string {
		return exploration.radiographs.map(radiograph => radiograph.type).join("&");
	}

	public searchBySignTypes() {
		this.currentPage = 1;
		this.getPageExplorations();
	}

	public cancel() { }

	public delete(id: string) {
		this.explorationsService.delete(id).subscribe(() => {
			this.notificationService.success(this.locationService.translate('Exploration removed successfully') + ".",
											 this.locationService.translate('Exploration removed'));
			this.getPageExplorations();
			this.updateChart.next();
		});
	}

	public recover(id: string) {
		this.explorationsService.recover(id).subscribe(() => {
			this.notificationService.success(this.locationService.translate('Exploration recovered successfully') + ".",
											 this.locationService.translate('Exploration recovered'));
			this.getPageExplorations();
			this.updateChart.next();
		});
	}

	public remove(id: string) {
		this.deletingExploration = true;
		this.exploration = this.explorations.find((exploration) => exploration.id === id);
	}

	public get currentPage(): number {
		return this._currentPage;
	}

	public set currentPage(page: number) {
		if (typeof page === 'number') {
			this._currentPage = page;
		}
	}

	public handlePageChange(event: number) {
		this.currentPage = event;
		this.getPageExplorations();
	}

	public handlePageSizeChange(event: any): void {
		this.pageSize = event.target.value;
		this.currentPage = 1;
		this.getPageExplorations();
	}

	private explorationSigns(exploration: Exploration): Sign[] {
		return exploration.radiographs.map(radiograph => radiograph.signs.map(sign => sign)).reduce((acc, val) => acc.concat(val), []);
	}

	public isAdmin(): boolean {
		return this.authenticationService.getRole() === Role.ADMIN;
	}

	public infoExploration(exploration: Exploration) {
		this.explorationsService.setExplorationId(exploration.id);
		this.explorationsService.setEditingExploration(false);
		this.router.navigate(['/exploration']);
	}

	public editExploration(exploration: Exploration) {
		this.explorationsService.setExplorationId(exploration.id);
		this.explorationsService.setEditingExploration(true);
		this.router.navigate(['/exploration'])
	}

	public applyDate(): void {
		this.getPageExplorations();
	}

	public selectedDate(value: any): void {
		this.initialDate = value.start;
		this.finalDate = value.end;
	}

	public cancelDate(): void {
		this.initialDate = undefined;
		this.finalDate = undefined;
		this.getPageExplorations();
	}
}