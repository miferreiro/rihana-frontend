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
import {Functionality} from '../models/Functionality';
import {FunctionalityInfo} from "./entities/FunctionalityInfo";

@Injectable({
	providedIn: 'root'
})
export class FunctionalitiesService {

	constructor(private http: HttpClient) {}

	public getFunctionalities(): Observable<Functionality[]> {
		return this.http.get<FunctionalityInfo[]>(`${environment.restApi}/functionality/`).pipe(
		  	map(functionalities => functionalities.map(this.mapFunctionalityInfo.bind(this)))
		);
	}

	public getFunctionality(id: number): Observable<Functionality> {
		return this.http.get<FunctionalityInfo[]>(`${environment.restApi}/functionality/${id}`).pipe(
			map(this.mapFunctionalityInfo.bind(this))
		);
	}

	public create(functionality: Functionality): Observable<Functionality> {
		const functionalityInfo = this.toFunctionalityInfo(functionality);

		return this.http.post<FunctionalityInfo>(`${environment.restApi}/functionality`, functionalityInfo).pipe(
			map(this.mapFunctionalityInfo.bind(this))
		);
	}

	public editFunctionality(functionality: Functionality): Observable<Functionality> {
		const functionalityInfo = this.toFunctionalityInfo(functionality);

		return this.http.put<FunctionalityInfo>(`${environment.restApi}/functionality/${functionality.id}`, functionalityInfo).pipe(
			map(this.mapFunctionalityInfo.bind(this))
		);
	}

	public deleteFunctionality(id: number) {
		return this.http.delete(`${environment.restApi}/functionality/${id}`);
	}

	private toFunctionalityInfo(functionality: Functionality): FunctionalityInfo {
		return {
			id: functionality.id,
			name: functionality.name,
			description: functionality.description,
		};
	}

	private mapFunctionalityInfo(functionalityInfo: FunctionalityInfo): Functionality {
		return {
			id: functionalityInfo.id,
			name: functionalityInfo.name,
			description: functionalityInfo.description,
		};
	}
}
