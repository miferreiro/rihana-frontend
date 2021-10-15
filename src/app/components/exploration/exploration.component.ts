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
import {Router} from '@angular/router';
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

	public newExploration: Exploration = new Exploration();
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
		this.newExploration.explorationDate = new Date();
		this.newExploration.user = new Users();
		this.newExploration.user.login = this.loggedUser;
		this.newExploration.report = new Report();
		this.newExploration.patient = new Patient();
		this.newExploration.patient.patientID = null;
		this.newExploration.patient.birthdate = null;
		this.newExploration.patient.sex = null;
		this.newExploration.radiographs = [];
		this.typeExploration = 'PA-LAT'
	}

	public reportHandler(reportResult: ReportResult): void {
		this.newExploration.report = reportResult.report;
		this.newExploration.patient = reportResult.patient;
	}

	public radiographsHandler(radiographs: Radiograph[]): void {
		this.newExploration.radiographs = radiographs;
	}

	public saveExploration(): void {
		if (this.newExploration.patient.patientID === null ||
			this.newExploration.patient.patientID === "" ||
			this.newExploration.report.reportNumber === null) {
			this.notificationService.warning("Upload a report", "Not possible create an exploration");
		} else if (this.newExploration.radiographs.length == 0) {
			this.notificationService.warning("Upload a radiograph", "Not possible create an exploration");
		} else if (this.typeExploration == 'PA-LAT' && this.newExploration.radiographs.length < 2) {
			this.notificationService.warning("The exploration is 'PA-LAT' type, therefore two loaded radiographs are required",
											 "Not possible create an exploration");
		} else {
			this.explorationsService.createExploration(this.newExploration).subscribe(newExploration => {
				this.explorationsService.setExplorationCreated(true);
				this.router.navigateByUrl(this.return);
			});
		}
	}

	public closeExploration(): void {
		this.newExploration.explorationDate = null;
		this.newExploration.user = null;
		this.newExploration.report = null;
		this.newExploration.patient = null;
		this.newExploration.radiographs = null;
		this.router.navigateByUrl(this.return);
	}

	public setTypeExploration(typeExploration: string): void {
		this.typeExploration = typeExploration;
	}
}