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
import {Role} from '../models/Role';
import {RoleInfo} from "./entities/RoleInfo";

@Injectable({
	providedIn: 'root'
})
export class RolesService {

	constructor(private http: HttpClient) {}

	public getRoles(): Observable<Role[]> {
		return this.http.get<RoleInfo[]>(`${environment.restApi}/role/`).pipe(
		  	map(roles => roles.map(this.mapRoleInfo.bind(this)))
		);
	}

	public getRole(id: number): Observable<Role> {
		return this.http.get<RoleInfo[]>(`${environment.restApi}/role/${id}`).pipe(
			map(this.mapRoleInfo.bind(this))
		);
	}

	public create(role: Role): Observable<Role> {
		const roleInfo = this.toRoleInfo(role);

		return this.http.post<RoleInfo>(`${environment.restApi}/role`, roleInfo).pipe(
			map(this.mapRoleInfo.bind(this))
		);
	}

	public editRole(role: Role): Observable<Role> {
		const roleInfo = this.toRoleInfo(role);
		return this.http.put<RoleInfo>(`${environment.restApi}/role/${role.id}`, roleInfo).pipe(
			map(this.mapRoleInfo.bind(this))
		);
	}

	public deleteRole(id: number) {
		return this.http.delete(`${environment.restApi}/role/${id}`);
	}

	private toRoleInfo(role: Role): RoleInfo {
		return {
			id: role.id,
			name: role.name,
			description: role.description,
		};
	}

	private mapRoleInfo(roleInfo: RoleInfo): Role {
		return {
			id: roleInfo.id,
			name: roleInfo.name,
			description: roleInfo.description,
		};
	}
}
