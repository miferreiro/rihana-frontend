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

import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {FunctionalityAction} from "../models/FunctionalityAction";
import {FunctionalityActionInfo} from "./entities/FunctionalityActionInfo";

@Injectable({
	providedIn: 'root'
})
export class FunctionalityActionsService {

	constructor(private http: HttpClient) {}

	public getFunctionalityActions(): Observable<FunctionalityAction[]> {
		return this.http.get<FunctionalityActionInfo[]>(`${environment.restApi}/functionalityaction/`).pipe(
			map(functionalityactions => functionalityactions.map(this.mapFunctionalityActionInfo.bind(this)))
		);
	}

	public getFunctionalityAction(functionalityId: number, actionId: number): Observable<FunctionalityAction> {
		return this.http.get<FunctionalityActionInfo[]>(`${environment.restApi}/functionalityaction/${functionalityId}/${actionId}`).pipe(
			map(this.mapFunctionalityActionInfo.bind(this))
		);
	}

	public create(functionalityAction: FunctionalityAction): Observable<FunctionalityAction> {
		const functionalityActionInfo = this.toFunctionalityActionInfo(functionalityAction);

		return this.http.post<FunctionalityActionInfo>(`${environment.restApi}/functionalityaction`, functionalityActionInfo).pipe(
			map(this.mapFunctionalityActionInfo.bind(this))
		);
	}

	public deleteFunctionalityAction(functionalityId: number, actionId: number) {
		return this.http.delete(`${environment.restApi}/functionalityaction/${functionalityId}/${actionId}`);
	}

	private toFunctionalityActionInfo(functionalityAction: FunctionalityAction): FunctionalityActionInfo {
		return {
			functionalityId: functionalityAction.functionalityId,
			actionId: functionalityAction.actionId,
		};
	}

	private mapFunctionalityActionInfo(functionalityActionInfo: FunctionalityActionInfo): FunctionalityAction {
		return {
			functionalityId: functionalityActionInfo.functionalityId,
			actionId: functionalityActionInfo.actionId,
		};
	}
}
