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
import {Navigation, Router} from '@angular/router';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ExplorationsService} from '../../services/explorations.service';
import {Exploration} from '../../models/Exploration';
import {Radiograph} from '../../models/Radiograph';
import {Report} from '../../models/Report';
import {Patient, SEX} from '../../models/Patient';
import {Users} from '../../models/Users';
import {ReportResult} from '../report/report.component';
import {EnumUtils} from '../../utils/enum.utils';

@Component({
	selector: 'app-exploration',
	templateUrl: './exploration.component.html',
	styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit {

	readonly return: string = '';
	public loggedUser: string;

	public exploration: Exploration = new Exploration();
	public typeExploration: string;
	public SEXValues: SEX[];

	constructor(private router: Router,
				private authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private explorationsService: ExplorationsService) { }

	ngOnInit(): void {
		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}
		this.SEXValues = EnumUtils.enumValues(SEX);

		if (this.explorationsService.getExplorationId() != undefined) {
			this.explorationsService.getExploration(this.explorationsService.getExplorationId()).subscribe(exploration => {
				this.exploration = exploration;
			});
		} else {
			this.exploration.explorationDate = new Date();
			this.exploration.user = new Users();
			this.exploration.user.login = this.loggedUser;
			this.exploration.report = new Report();
			this.exploration.patient = new Patient();
			this.exploration.patient.patientID = null;
			this.exploration.patient.birthdate = null;
			this.exploration.patient.sex = null;
			this.exploration.radiographs = [];
			this.typeExploration = 'PA-LAT';
		}
	}

	public reportHandler(reportResult: ReportResult): void {
		this.exploration.report = reportResult.report;
		this.exploration.patient = reportResult.patient;
	}

	public radiographsHandler(radiographs: Radiograph[]): void {
		this.exploration.radiographs = radiographs;
	}

	public saveExploration(): void {
		if (this.exploration.patient.patientID === null ||
			this.exploration.patient.patientID === "" ||
			this.exploration.report.reportNumber === null) {
			this.notificationService.warning("Upload a report", "Not possible create an exploration");
		} else if (this.exploration.radiographs.length == 0) {
			this.notificationService.warning("Upload a radiograph", "Not possible create an exploration");
		} else if (this.typeExploration == 'PA-LAT' && this.exploration.radiographs.length < 2) {
			this.notificationService.warning("The exploration is 'PA-LAT' type, therefore two loaded radiographs are required",
											 "Not possible create an exploration");
		} else {
			this.explorationsService.createExploration(this.exploration).subscribe(exploration => {
				this.explorationsService.setExplorationCreated(true);
				this.router.navigateByUrl(this.return);
			});
		}
	}

	public closeExploration(): void {
		this.exploration.explorationDate = null;
		this.exploration.user = null;
		this.exploration.report = null;
		this.exploration.patient = null;
		this.exploration.radiographs = null;
		this.router.navigateByUrl(this.return);
	}

	public setTypeExploration(typeExploration: string): void {
		this.typeExploration = typeExploration;
	}
}