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

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ExplorationsService} from '../../services/explorations.service';
import {SignsService} from '../../services/signs.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {Exploration} from '../../models/Exploration';
import {Subject} from 'rxjs';
import {Sign} from '../../models/Sign';
import {assignColorTypeSign, SignType} from '../../models/SignType';

@Component({
	selector: 'app-explorations',
	templateUrl: './explorations.component.html',
	styleUrls: ['./explorations.component.css']
})
export class ExplorationsComponent implements OnInit {

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

	public deletingExploration:boolean = false;

	public updateChart: Subject<void> = new Subject<void>();

	constructor(private authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private locationService: LocalizationService,
				private explorationsService: ExplorationsService,
				private signsService: SignsService) { }

	ngOnInit() {
		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}

		this.pageSize = 6;
		this.currentPage = 1;
		this.getSignTypes();
		this.getPageExplorations();
	}

	private getSignTypes() {
		this.signsService.getSignTypes().subscribe(signTypes =>
			this.signTypes = signTypes
		)
	}

	getPageExplorations() {
		this.explorationsService.getTotalExplorations(this.loggedUser, this.currentPage, this.pageSize, this.signTypesFilter).subscribe(explorationPage => {
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

	public assignColorTypeSign(signType: SignType, colorSecondary: boolean = false): string {
		return assignColorTypeSign(signType, colorSecondary);
	}

	private explorationSigns(exploration: Exploration): Sign[] {
		return exploration.radiographs.map(radiograph => radiograph.signs.map(sign => sign)).reduce((acc, val) => acc.concat(val), []);
	}
}