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
import {NewPatientInfo} from './entities/NewPatientInfo';
import {NewRadiographInfo} from './entities/NewRadiographInfo';
import {NewSignInfo} from './entities/NewSignInfo';
import {PatientsService} from './patients.service';
import {ReportsService} from './reports.service';
import {RadiographsService} from './radiographs.service';
import {Exploration} from '../models/Exploration';
import {Patient, SEX} from '../models/Patient';
import {Radiograph} from '../models/Radiograph';
import {Report} from '../models/Report';
import {Sign} from '../models/Sign';
import {SignType} from '../models/SignType';
import {Users} from '../models/Users';

@Injectable()
export class ExplorationsService {

	private explorationCreated: boolean = false;

	constructor(private http: HttpClient,
				private patientsService: PatientsService,
				private reportsService: ReportsService,
				private radiographsService: RadiographsService) {
	}

	getTotalExplorations(user: string, page: number, pageSize: number, signTypes: SignType[]): Observable<ExplorationPage> {
		return this.getExplorations(user, page, pageSize, signTypes, new HttpParams());
	}

	createExploration(exploration: Exploration): Observable<Exploration> {
		const newExplorationInfo = this.toNewExplorationInfo(exploration);
		return this.http.post<NewExplorationInfo>(`${environment.restApi}/exploration`, newExplorationInfo)
			.pipe(
				map(this.mapExplorationInfo.bind(this))
			);
	}

	getExplorationCreated(): boolean {
		return this.explorationCreated;
	}

	setExplorationCreated(explorationCreated: boolean): void {
		this.explorationCreated = explorationCreated;
	}

	delete(id: string): Observable<Object> {
		return this.http.delete(`${environment.restApi}/exploration/` + id);
	}

	recover(id: string): Observable<Object> {
		return this.http.put(`${environment.restApi}/exploration/recover/` + id, null);
	}

	private getExplorations(user: string, page: number, pageSize: number, signTypes: SignType[], params: HttpParams): Observable<ExplorationPage> {
		params = params.append('user', user).append('page', page.toString()).append('pageSize', pageSize.toString());

		signTypes.forEach(signType => params = params.append('signType', signType.code));

		return this.http.get<ExplorationInfo[]>(`${environment.restApi}/exploration/`, {params, observe: 'response'}).pipe(
			concatMap(response => {
				return this.withUserPatientReportAndRadiographs(of(response.body), user
				).pipe(
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

	private withUserPatientReportAndRadiographs(explorationInfoObservable: Observable<ExplorationInfo[]>,
												user: string): Observable<Exploration[]> {
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
			id: sign.id,
			type: sign.type,
			location: sign.location,
			brightness: sign.brightness,
			contrast: sign.contrast
		}
	}
}