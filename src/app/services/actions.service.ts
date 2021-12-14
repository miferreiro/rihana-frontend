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

import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {Action} from '../models/Action';
import {ActionInfo} from "./entities/ActionInfo";

@Injectable({
	providedIn: 'root'
})
export class ActionsService {

	constructor(private http: HttpClient) {
	}

	getActions(): Observable<Action[]> {
		return this.http.get<ActionInfo[]>(`${environment.restApi}/action/`).pipe(
		  	map(actions => actions.map(this.mapActionInfo.bind(this)))
		);
	}

	getAction(id: number): Observable<Action> {
		return this.http.get<ActionInfo[]>(`${environment.restApi}/action/${id}`).pipe(
			map(this.mapActionInfo.bind(this))
		);
	}

	create(action: Action): Observable<Action> {
		const actionInfo = this.toActionInfo(action);

		return this.http.post<ActionInfo>(`${environment.restApi}/action`, actionInfo).pipe(
			map(this.mapActionInfo.bind(this))
		);
	}

	editAction(action: Action): Observable<Action> {
		const actionInfo = this.toActionInfo(action);
		return this.http.put<ActionInfo>(`${environment.restApi}/action/${action.id}`, actionInfo).pipe(
			map(this.mapActionInfo.bind(this))
		);
	}

	deleteAction(id: number) {
		return this.http.delete(`${environment.restApi}/action/${id}`);
	}

	private toActionInfo(action: Action): ActionInfo {
		return {
			id: action.id,
			name: action.name,
			description: action.description,
		};
	}

	private mapActionInfo(actionInfo: ActionInfo): Action {
		return {
			id: actionInfo.id,
			name: actionInfo.name,
			description: actionInfo.description,
		};
	}
}
