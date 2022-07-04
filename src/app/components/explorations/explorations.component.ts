/*
 * RIHANA Frontend
 *
 * Copyright (C) 2021-2022 David A. Ruano Ordás, José Ramón Méndez Reboredo,
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
import JSZip from 'jszip';
import FileSaver from 'file-saver';

@Component({
	selector: 'app-explorations',
	templateUrl: './explorations.component.html',
	styleUrls: ['./explorations.component.css']
})
export class ExplorationsComponent implements OnInit, AfterViewChecked {

	public readonly formatDateEs: string = 'dd/MM/yyyy';
	public readonly formatDateEn: string = 'MM/dd/yyyy';
	public currentFormatDate: string = 'dd/MM/yyyy';
	public loggedUser: string;
	public signTypes: SignType[];
	public signTypesFilter: SignType[] = [];
	public operator: string = "AND";
	public explorations: Exploration[] = [];
	public exploration: Exploration = new Exploration();
	public paginationTotalItems: number;
	public pageSize: number;
	public pageChangeEvent = new Subject<string>();
	public lastPage: number;
	public deletingExploration: boolean = false;
	public recoveringExploration: boolean = false;
	public updateChart: Subject<void> = new Subject<void>();
	public isdownloadingExploration: boolean = false;
	public downloadingExplorations: boolean = false;
	public downloadingSelectExplorations: boolean = false;
	public selectToDownload: boolean = false;
	public explorationDownloading: string = undefined;
	public explorationsToDownload = new Map();
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
				this.localizationService.translate("Sunday").substr(0, 2),
				this.localizationService.translate("Monday").substr(0, 2),
				this.localizationService.translate("Tuesday").substr(0, 2),
				this.localizationService.translate("Wednesday").substr(0, 2),
				this.localizationService.translate("Thursday").substr(0, 2),
				this.localizationService.translate("Friday").substr(0, 2),
				this.localizationService.translate("Saturday").substr(0, 2)
			],
			monthNames: [
				this.localizationService.translate("January"),
				this.localizationService.translate("February"),
				this.localizationService.translate("March"),
				this.localizationService.translate("April"),
				this.localizationService.translate("May"),
				this.localizationService.translate("June"),
				this.localizationService.translate("July"),
				this.localizationService.translate("August"),
				this.localizationService.translate("September"),
				this.localizationService.translate("October"),
				this.localizationService.translate("November"),
				this.localizationService.translate("December")
			],
			"firstDay": 1
		},
		minDate: '01/01/2021',
		maxDate: new Date(),
		opens: 'left',
		showDropdowns: true,
		timePicker: false
	};

	private readonly formatDate: string = 'DD/MM/yyyy_HH:mm:ss';
	private _currentPage: number;

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private explorationsService: ExplorationsService,
				private signTypesService: SignTypesService,
				private router: Router) { }

	ngOnInit() {
		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}

		if (this.localizationService.getCurrentLocaleId() === 'en') {
			this.options.locale.format = 'MM/DD/yyyy';
			this.currentFormatDate = this.formatDateEn;
		} else {
			this.options.locale.format = 'DD/MM/yyyy';
			this.currentFormatDate = this.formatDateEs;
		}

		this.pageSize = 6;
		this.currentPage = 1;
		this.initialDate = undefined;
		this.finalDate = undefined;
		this.operator = "AND";
		this.getSignTypes();
		this.getPageExplorations();
		this.explorationsService.setExplorationId(undefined);
	}

	ngAfterViewChecked() {
		if (this.explorationsService.getExplorationCreated()) {
			this.notificationService.success("Exploration registered successfully", "Exploration registered");
			this.explorationsService.setExplorationCreated(false);
		}

		if (this.explorationsService.getExplorationEdited()) {
			this.notificationService.success("Exploration edited successfully", "Exploration edited");
			this.explorationsService.setExplorationEdited(false);
		}
		document.getElementsByClassName("applyDate")[0].textContent = this.localizationService.translate("Apply");
		document.getElementsByClassName("cancelDate")[0].textContent = this.localizationService.translate("Cancel");
	}

	public getPageExplorations() {
		let initialDate: Date = undefined;
		let finalDate: Date = undefined;
		if (this.initialDate != undefined) initialDate = this.initialDate.format(this.formatDate)
		if (this.finalDate != undefined) finalDate = this.finalDate.format(this.formatDate)

		let user: string = undefined;
		if (this.loggedUser != "admin" && this.loggedUser != "supervisor") {
			user = this.loggedUser
		}

		this.explorationsService.getTotalExplorations(user, this.currentPage, this.pageSize,
			this.signTypesFilter, this.operator, false, initialDate, finalDate).subscribe(explorationPage => {
			this.paginationTotalItems = explorationPage.totalItems;
			this.lastPage = Math.ceil(this.paginationTotalItems / this.pageSize);
			this.explorations = explorationPage.explorations;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the explorations. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve explorations");
		});
	}

	public getExplorationSigns(exploration: Exploration): Sign[] {
		return [...new Map(this.explorationSigns(exploration).map(item => [item.type.code, item])).values()]
			.sort((a, b) => a.type.code.localeCompare(b.type.code));
	}

	public getNumExplorationSignType(exploration: Exploration, code: string): number {
		return this.explorationSigns(exploration).filter(sign => sign.type.code == code).length;
	}

	public getRadiographType(exploration: Exploration): string {
		return exploration.radiographs.map(radiograph => radiograph.type).sort((a, b) => -a.localeCompare(b)).join('&');
	}

	public searchBySignTypes() {
		this.currentPage = 1;
		this.getPageExplorations();
	}

	public cancel() { }

	public delete(id: string) {
		this.explorationsService.delete(id).subscribe(() => {
			this.notificationService.success("Exploration removed successfully",
											 "Exploration removed");
			this.getPageExplorations();
			this.updateChart.next();
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the exploration. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to remove the exploration");
		});
	}

	public recover(id: string) {
		this.explorationsService.recover(id).subscribe(() => {
			this.notificationService.success(this.localizationService.translate("Exploration recovered successfully") + '.',
											 "Exploration recovered");
			this.getPageExplorations();
			this.updateChart.next();
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error recovering the exploration. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to recover the exploration");
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

	public changeOperator() {
		if (this.operator.match("AND")) {
			this.operator = "OR";
		} else {
			this.operator = "AND";
		}
		this.currentPage = 1;
		this.getPageExplorations();
	}

	public isAdmin(): boolean {
		return this.authenticationService.getRole() === Role.ADMIN;
	}

	public isSupervisor(): boolean {
		return this.authenticationService.getRole() === Role.SUPERVISOR;
	}

	public infoExploration(exploration: Exploration) {
		this.explorationsService.setExplorationId(exploration.id);
		this.explorationsService.setEditingExploration(false);
		this.router.navigate(['/exploration']);
	}

	public addExploration() {
		this.explorationsService.setExplorationId(undefined);
		this.explorationsService.setEditingExploration(false);
		this.router.navigate(['/exploration'])
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

	public getIdExplorationsToDownload(): string[] {
		return Array.from(this.explorationsToDownload.keys());
	}

	public getTitleExplorationsToDownload(id: string): string {
		return this.explorationsToDownload.get(id);
	}

	public isExplorationSelected(): boolean {
		return this.explorationsToDownload.size != 0;
	}

	public checkMark(exploration: Exploration) {

		if (this.explorationsToDownload.has(exploration.id)) {
			this.explorationsToDownload.delete(exploration.id);
		} else {
			this.explorationsToDownload.set(exploration.id, exploration.title);
		}
	}

	public uncheckMark(id: string) {
		this.explorationsToDownload.delete(id);
	}

	public isCardChecked(id: string): boolean {
		return this.explorationsToDownload.has(id);
	}

	public activateSelection(): void {
		if (!this.selectToDownload) {
			this.explorationsToDownload = new Map()
		}
		this.selectToDownload = true;
	}

	public downloadSelectedExplorations() {
		this.downloadingSelectExplorations = true;
		this.notificationService.info("The selected explorations are being packaged",
									  "Downloading the selected explorations");

		let zip: JSZip = new JSZip();
		const imgFolderPath: string = "files";
		let calls = Array.from(this.explorationsToDownload.keys()).map(id => {
			return this.explorationsService.getExploration(id, true).toPromise();
		});

		Promise.all(calls)
			.then(async (explorations) => {
				explorations.forEach(exploration => {
					let explorationFolder: JSZip = zip.folder(exploration.title);
					let imgFolder: JSZip = explorationFolder.folder(imgFolderPath);
					exploration.radiographs.map(radiograph => {
						let contentType: string = radiograph.source.split(",")[0];
						let b64Data: string = radiograph.source.split(",")[1];
						let blob: Blob = this.b64toBlob(b64Data, contentType);
						imgFolder.file(radiograph.type + '.png', blob);
						radiograph.source = imgFolderPath + '/' + radiograph.type + '.png';
					});
					let blob: any = new Blob([JSON.stringify(exploration)], {type: 'text/json'});
					explorationFolder.file(exploration.title + '.json', blob);
				})
			})
			.then(async () => {
				zip.generateAsync({ type: "blob" }).then(content => {
					FileSaver.saveAs(content, 'explorations.zip');
					this.notificationService.success("Selected explorations downloaded successfully",
													 "Selected explorations downloaded");
					this.selectToDownload = false;
					this.downloadingSelectExplorations = false;
				});
			});
	}

	public downloadExplorations() {
		this.downloadingExplorations = true;
		this.notificationService.info("The explorations are being packaged",
									  "Downloading the explorations");
		let initialDate: Date = undefined;
		let finalDate: Date = undefined;
		if (this.initialDate != undefined) initialDate = this.initialDate.format(this.formatDate)
		if (this.finalDate != undefined) finalDate = this.finalDate.format(this.formatDate)

		let user: string = undefined;
		if (this.loggedUser != "admin" && this.loggedUser != "supervisor") {
			user = this.loggedUser
		}

		this.explorationsService.getTotalExplorations(user, undefined, undefined,
			this.signTypesFilter, this.operator, true, initialDate, finalDate).subscribe(explorationPage => {
				let zip: JSZip = new JSZip();
				const imgFolderPath: string = "files";
				explorationPage.explorations.forEach(exploration => {
					let explorationFolder: JSZip = zip.folder(exploration.title);
					let imgFolder: JSZip = explorationFolder.folder(imgFolderPath);
					exploration.radiographs.map(radiograph => {
						let contentType: string = radiograph.source.split(",")[0];
						let b64Data: string = radiograph.source.split(",")[1];
						let blob: Blob = this.b64toBlob(b64Data, contentType);
						imgFolder.file(radiograph.type + '.png', blob);
						radiograph.source = imgFolderPath + '/' + radiograph.type + '.png';
					});
					let blob: any = new Blob([JSON.stringify(exploration)], {type: 'text/json'});
					explorationFolder.file(exploration.title + '.json', blob);
				});

				zip.generateAsync({ type: "blob" }).then(content => {
					FileSaver.saveAs(content, 'explorations.zip');
					this.notificationService.success("Explorations downloaded successfully",
													 "Explorations downloaded");
					this.selectToDownload = false;
					this.downloadingExplorations = false;
				});
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error downloading the explorations. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to download the explorations");
			this.selectToDownload = false;
		});
	}

	public downloadExploration(id: string) {
		this.isdownloadingExploration = true;
		this.explorationDownloading = id;

		this.notificationService.info("The exploration is being packaged",
									  "Downloading the exploration");

		this.explorationsService.getExploration(id, true).subscribe(exploration => {

			let zip: JSZip = new JSZip();

			const imgFolderPath: string = "files";
			let imgFolder: JSZip = zip.folder(imgFolderPath);

			exploration.radiographs.map(radiograph => {
				let contentType = radiograph.source.split(",")[0];
				let b64Data = radiograph.source.split(",")[1];
				let blob = this.b64toBlob(b64Data, contentType);
				imgFolder.file(radiograph.type + '.png', blob);
				radiograph.source = imgFolderPath + '/' + radiograph.type + '.png';
			});

			let blob:any = new Blob([JSON.stringify(exploration)], {type: 'text/json'});

			zip.file(exploration.title + '.json', blob);

			zip.generateAsync({ type: "blob" }).then(content => {
				FileSaver.saveAs(content, exploration.id + '.zip');
				this.isdownloadingExploration = false;
				this.explorationDownloading = undefined;
				this.notificationService.success("Exploration downloaded successfully",
												 "Exploration downloaded");
			});
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error downloading the exploration. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to download the exploration");
		});
	}

	private explorationSigns(exploration: Exploration): Sign[] {
		return exploration.radiographs.map(radiograph => radiograph.signs.map(sign => sign)).reduce((acc, val) => acc.concat(val), []);
	}

	private getSignTypes() {
		this.signTypesService.getSignTypes().subscribe(signTypes => {
			this.signTypes = signTypes
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the sign types. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve sign types");
		});
	}

	private b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}
}