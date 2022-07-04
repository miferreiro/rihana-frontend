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
import {Permission} from "../models/Permission";
import {FunctionalityActionInfo} from "./entities/FunctionalityActionInfo";
import {PermissionInfo} from "./entities/PermissionInfo";

@Injectable({
	providedIn: 'root'
})
export class PermissionsService {

	constructor(private http: HttpClient) {}

	public getPermissions(): Observable<Permission[]> {
		return this.http.get<PermissionInfo[]>(`${environment.restApi}/permission/`).pipe(
		  	map(permissions => permissions.map(this.mapPermissionInfo.bind(this)))
		);
	}

	public getPermission(roleId: number, functionalityId: number, actionId: number): Observable<Permission> {
		return this.http.get<PermissionInfo[]>(`${environment.restApi}/permission/${roleId}/${functionalityId}/${actionId}`).pipe(
			map(this.mapPermissionInfo.bind(this))
		);
	}

	public getUserPermissions(login: string): Observable<FunctionalityAction[]> {
		return this.http.get<FunctionalityAction[]>(`${environment.restApi}/permission/${login}`).pipe(
			map(functionalityActions => functionalityActions.map(this.mapFunctionalityActionInfo.bind(this)))
		);
	}

	public create(permission: Permission): Observable<Permission> {
		const permissionInfo = this.toPermissionInfo(permission);

		return this.http.post<PermissionInfo>(`${environment.restApi}/permission`, permissionInfo).pipe(
			map(this.mapPermissionInfo.bind(this))
		);
	}

	public deletePermission(roleId: number, functionalityId: number, actionId: number) {
		return this.http.delete(`${environment.restApi}/permission/${roleId}/${functionalityId}/${actionId}`);
	}

	private toPermissionInfo(permission: Permission): PermissionInfo {
		return {
			roleId: permission.roleId,
			functionalityId: permission.functionalityAction.functionalityId,
			actionId: permission.functionalityAction.actionId,
		};
	}

	private mapPermissionInfo(permisssionInfo: PermissionInfo): Permission {
		return {
			roleId: permisssionInfo.roleId,
			functionalityAction:  {
				functionalityId: permisssionInfo.functionalityId,
				actionId: permisssionInfo.actionId
			}
		};
	}

	private mapFunctionalityActionInfo(functionalityActionInfo: FunctionalityActionInfo): FunctionalityAction {
		return {
			functionalityId: functionalityActionInfo.functionalityId,
			actionId: functionalityActionInfo.actionId
		};
	}
}
