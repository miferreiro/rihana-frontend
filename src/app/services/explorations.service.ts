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
import {IdAndUri} from './entities/IdAndUri';
import {ExplorationInfo} from './entities/ExplorationInfo';
import {ExplorationPage} from './entities/ExplorationPage';
import {environment} from '../../environments/environment';
import {forkJoin, Observable, of} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {Exploration} from '../models/Exploration';
import {Patient} from '../models/Patient';
import {PatientsService} from './patients.service';
import {UsersService} from './users.service';
import {ReportsService} from './reports.service';
import {RadiographsService} from './radiographs.service';
import {Users} from '../models/Users';
import {Radiograph} from '../models/Radiograph';
import {Report} from '../models/Report';
import {SignType} from '../models/SignType';

@Injectable()
export class ExplorationsService {

	constructor(private http: HttpClient,
				private usersService: UsersService,
				private patientsService: PatientsService,
				private reportsService: ReportsService,
				private radiographsService: RadiographsService) {
	}

	getTotalExplorations(user: string, page: number, pageSize: number, signTypes: SignType[]): Observable<ExplorationPage> {
		return this.getExplorations(user, page, pageSize, signTypes, new HttpParams());
	}

	delete(id: string) {
		return this.http.delete(`${environment.restApi}/exploration/` + id);
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
						this.usersService.getUser(user),
						forkJoin(explorationInfos.map(explorationInfo =>
							this.patientsService.getPatient((<IdAndUri>explorationInfo.patient).id)
						)),
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
										userPatientReportAndRadiographs[0][index],
										userPatientReportAndRadiographs[1][index],
										userPatientReportAndRadiographs[2][index],
										userPatientReportAndRadiographs[3][index])
							)
						)
					)
				)
			);
	}

	private mapExplorationInfo(explorationInfo: ExplorationInfo, user: Users, patient: Patient, report: Report, radiographs: Radiograph[]): Exploration {
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