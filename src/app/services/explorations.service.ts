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

import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {EnumUtils} from '../utils/enum.utils';
import {ExplorationInfo} from './entities/ExplorationInfo';
import {ExplorationPage} from './entities/ExplorationPage';
import {IdAndUri} from './entities/IdAndUri';
import {NewExplorationInfo} from './entities/NewExplorationInfo';
import {EditExplorationInfo} from './entities/EditExplorationInfo';
import {NewPatientInfo} from './entities/NewPatientInfo';
import {NewPerformedExplorationInfo, NewReportInfo, NewRequestedExplorationInfo} from './entities/NewReportInfo';
import {NewRadiographInfo} from './entities/NewRadiographInfo';
import {NewSignInfo} from './entities/NewSignInfo';
import {PatientsService} from './patients.service';
import {ReportsService} from './reports.service';
import {RadiographsService} from './radiographs.service';
import {Exploration} from '../models/Exploration';
import {Patient, SEX} from '../models/Patient';
import {Radiograph} from '../models/Radiograph';
import {PerformedExploration, Report, RequestedExploration} from '../models/Report';
import {Sign} from '../models/Sign';
import {SignType} from '../models/SignType';
import {Users} from '../models/Users';

@Injectable()
export class ExplorationsService {

	private explorationCreated: boolean = false;
	private explorationEdited: boolean = false;

	private explorationId: string;
	private editingExploration: boolean = false;

	constructor(private http: HttpClient,
				private patientsService: PatientsService,
				private reportsService: ReportsService,
				private radiographsService: RadiographsService) {
	}

	getExplorationCreated(): boolean {
		return this.explorationCreated;
	}

	setExplorationCreated(explorationCreated: boolean): void {
		this.explorationCreated = explorationCreated;
	}

	getExplorationEdited(): boolean {
		return this.explorationEdited;
	}

	setExplorationEdited(explorationEdited: boolean): void {
		this.explorationEdited = explorationEdited;
	}

	getExplorationId(): string {
		return this.explorationId;
	}

	setExplorationId(explorationId: string): void {
		this.explorationId = explorationId;
	}

	getEditingExploration(): boolean {
		return this.editingExploration;
	}

	setEditingExploration(editingExploration: boolean): void {
		this.editingExploration = editingExploration;
	}

	getExploration(uuid: string, source: boolean = false): Observable<Exploration> {
		return this.http.get<ExplorationInfo>(`${environment.restApi}/exploration/${uuid}`)
			.pipe(
				concatMap(explorationInfo =>
					forkJoin(
						this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id),
						this.reportsService.getReport((<IdAndUri>explorationInfo.report).id),
						forkJoin(explorationInfo.radiographs.map(radiograph => {
							return this.radiographsService.getRadiograph((<IdAndUri>radiograph).id, source).pipe(
								map(radiograph => radiograph)
							);
						}))
					)
					.pipe(
						map(patientReportAndRadiographs => {
							return this.mapExplorationInfo(
								explorationInfo,
								explorationInfo.user,
								patientReportAndRadiographs[0],
								patientReportAndRadiographs[1],
								patientReportAndRadiographs[2])
						})
						)
					)
				)
	}

	getTotalExplorations(user: string, page: number, pageSize: number, signTypes: SignType[], operator: string,
						 source: boolean = false, initialDate: Date, finalDate: Date): Observable<ExplorationPage> {
		return this.getExplorations(user, page, pageSize, signTypes, operator, source, initialDate, finalDate, new HttpParams());
	}

	createExploration(exploration: Exploration): Observable<Exploration> {
		const newExplorationInfo = this.toNewExplorationInfo(exploration);
		return this.http.post<NewExplorationInfo>(`${environment.restApi}/exploration`, newExplorationInfo)
			.pipe(
				map(this.mapExplorationInfo.bind(this))
			);
	}

	editExploration(exploration: Exploration): Observable<Exploration> {
		const explorationInfo = this.toEditExplorationInfo(exploration);
		return this.http.put<ExplorationInfo>(`${environment.restApi}/exploration/${explorationInfo.id}`, explorationInfo)
			.pipe(
				map(this.mapExplorationInfo.bind(this))
			);
	}

	delete(id: string): Observable<Object> {
		return this.http.delete(`${environment.restApi}/exploration/` + id);
	}

	recover(id: string): Observable<Object> {
		return this.http.put(`${environment.restApi}/exploration/recover/` + id, null);
	}

	private getExplorations(user: string, page: number, pageSize: number, signTypes: SignType[], operator: string,
		source: boolean = false, initialDate: Date, finalDate: Date, params: HttpParams): Observable<ExplorationPage> {
		if (user != undefined) {
			params = params.append('user', user);
		}
		params = params.append('page', page.toString()).append('pageSize', pageSize.toString());

		if (operator.match("AND")) {
			params = params.append('signType', signTypes.map(s => s.code).join(";"));
		} else {
			params = params.append('signType', signTypes.map(s => s.code).join(","));
		}

		if (initialDate != undefined) {
			params = params.append('initialDate', initialDate.toString());
		}
		if (initialDate != undefined) {
			params = params.append('finalDate', finalDate.toString());
		}

		return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`, {params, observe: 'response'}).pipe(
			concatMap(response => {
				return this.withPatientReportAndRadiographs(of(response.body), source).pipe(
					map(explorationsWithPatient => {
						const explorationPage: ExplorationPage = {
							totalItems: Number(response.headers.get('X-Pagination-Total-Items')),
							explorations: explorationsWithPatient
						};
						return explorationPage;
					})
				);
			})
		);
	}

	private withPatientReportAndRadiographs(explorationInfoObservable: Observable<ExplorationInfo[]>, source: boolean): Observable<Exploration[]> {
		return explorationInfoObservable
			.pipe(
				concatMap(explorationInfos =>
					explorationInfos.length === 0 ? of([]) :
					forkJoin([
						forkJoin(explorationInfos.map(explorationInfo =>
							this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id))),
						forkJoin(explorationInfos.map(explorationInfo =>
							this.reportsService.getReport((<IdAndUri>explorationInfo.report).id)
						)),
						forkJoin(explorationInfos.map(explorationInfo =>
							forkJoin(explorationInfo.radiographs.map(radiograph => {
								return this.radiographsService.getRadiograph((<IdAndUri>radiograph).id);
							}))
						))
					])
					.pipe(
						map(userPatientReportAndRadiographs =>
							explorationInfos.map((explorationInfo, index) =>
								this.mapExplorationInfo(explorationInfo,
									explorationInfo.user,
									userPatientReportAndRadiographs[0][index],
									userPatientReportAndRadiographs[1][index],
									userPatientReportAndRadiographs[2][index])
							)
						)
					)
				)
			);
	}

	private mapExplorationInfo(explorationInfo: ExplorationInfo, user: Users, patient: Patient, report: Report, radiographs: Radiograph[]): Exploration {
		if (explorationInfo.deleted != null) {
			return {
				id: explorationInfo.id,
				title: explorationInfo.title,
				explorationDate: explorationInfo.explorationDate,
				user: user,
				patient: patient,
				report: report,
				radiographs: radiographs,
				deleted: explorationInfo.deleted
			};
		} else {
			return {
				id: explorationInfo.id,
				title: explorationInfo.title,
				explorationDate: explorationInfo.explorationDate,
				user: user,
				patient: patient,
				report: report,
				radiographs: radiographs
			};
		}
	}

	private toEditExplorationInfo(exploration: Exploration): EditExplorationInfo {

		let report: NewReportInfo;
		let patient: NewPatientInfo;

		report = this.toNewReportInfo(exploration.report);
		patient = this.toNewPatientInfo(exploration.patient)

		return {
			id: exploration.id,
			explorationDate: exploration.explorationDate,
			user: exploration.user.login,
			patient: patient,
			report: report,
			radiographs: exploration.radiographs.map(radiograph => this.toNewRadiographInfo(radiograph))
		};
	}

	private toNewExplorationInfo(exploration: Exploration): NewExplorationInfo {

		let report: Report;
		let patient: NewPatientInfo;

		report = exploration.report;
		patient = this.toNewPatientInfo(exploration.patient)

		return {
			explorationDate: exploration.explorationDate,
			user: exploration.user.login,
			patient: patient,
			report: report,
			radiographs: exploration.radiographs.map(radiograph => this.toNewRadiographInfo(radiograph))
		};
	}

	private toNewPatientInfo(patient: Patient): NewPatientInfo {
		if (patient.sex != null && patient.birthdate != null) {
			return {
				patientID: patient.patientID,
				sex: EnumUtils.findKeyForValue(SEX, patient.sex),
				birthdate: new Date(patient.birthdate)
			};
		} else if (patient.sex != null) {
			return {
				patientID: patient.patientID,
				sex: EnumUtils.findKeyForValue(SEX, patient.sex)
			};
		} else if (patient.birthdate != null) {
			return {
				patientID: patient.patientID,
				birthdate: new Date(patient.birthdate)
			};
		} else {
			return {
				patientID: patient.patientID
			};
		}

	}

	private toNewRadiographInfo(radiograph: Radiograph): NewRadiographInfo {
		return {
			type: radiograph.type,
			source: radiograph.source,
			signs: radiograph.signs.map(sign => this.toNewSignInfo(sign)),
			observations: radiograph.observations
		}
	}

	private toNewSignInfo(sign: Sign): NewSignInfo {
		return {
			type: sign.type,
			location: sign.location,
			brightness: sign.brightness,
			contrast: sign.contrast
		}
	}

	private toNewReportInfo(report: Report): NewReportInfo {
		return {
			completionDate: report.completionDate,
			reportNumber: report.reportNumber,
			applicant: report.applicant,
			priority: report.priority,
			status: report.status,
			bed: report.bed,
			requestedExplorations: report.requestedExplorations.map(
				requestedExploration => this.toNewRequestedExplorationInfo(requestedExploration)
			),
			clinicalData: report.clinicalData,
			performedExplorations: report.performedExplorations.map(
				performedExploration => this.toNewPerformedExplorationInfo(performedExploration)
			),
			findings: report.findings,
			conclusions: report.conclusions
		}
	}

	private toNewRequestedExplorationInfo(requestedExplorations: RequestedExploration): NewRequestedExplorationInfo {
		return {
			code: requestedExplorations.code,
			description: requestedExplorations.description,
			date: requestedExplorations.date
		}
	}

	private toNewPerformedExplorationInfo(performedExplorations: PerformedExploration): NewPerformedExplorationInfo {
		return {
			code: performedExplorations.code,
			description: performedExplorations.description,
			date: performedExplorations.date,
			portable: performedExplorations.portable,
			surgery: performedExplorations.surgery,
		}
	}
}