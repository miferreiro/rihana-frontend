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
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";
import {environment} from '../../environments/environment';
import {RihanaError} from '../modules/notification/entities';
import {Role, User} from '../models/User';
import {PermissionsService} from './permissions.service';

@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {

	private user: User = new User();

	constructor(private  http: HttpClient,
				private permissionsService: PermissionsService) {
	}

	checkCredentials(login: string, password: string): Observable<Role> {
		this.user.login = login;
		this.user.password = password;
		return this.http.get<string>(`${environment.restApi}/user/${login}/role`, {responseType: 'text' as 'json'})
		.pipe(
			map(role => Role[role.toString()]),
			RihanaError.throwOnError('Failed to login', `User or password incorrect. Please try again.`)
		);
	}

	public async logIn(login: string, password: string, role: Role) {
		this.user.login = login;
		this.user.password = password;
		this.user.role = role;
		this.user.authHeader = this.getAuthorizationHeader();
		this.user.authenticated = true;
		this.user.permissions = await this.permissionsService.getUserPermissions(login).toPromise()
		this.user.save();
	}

	public logOut() {
		this.user.clear();
		this.user = new User();
	}

	public getAuthorizationHeader(): string {
		return 'Basic ' + btoa(this.user.login + ':' + this.user.password);
	}

	public getUser(): User {
		return this.user;
	}

	public getRole(): Role {
		return this.user.role;
	}

	public isGuest(): boolean {
		return !this.user.authenticated;
	}

	public isAdmin(): boolean {
		return this.user.role == "ADMIN";
	}

	public hasPermission(functionality: number, action: number): boolean {
		if (this.user.permissions.length > 0) {
			return this.isAdmin() || this.user.permissions.filter(function(permission) {
				return permission.functionalityId === functionality && permission.actionId === action
			}).length > 0;
		} else {
			return this.isAdmin();
		}
	}

	public hasFunctionalityPermission(functionality: number): boolean {
		if (this.user.permissions.length > 0) {
			return this.isAdmin() || this.user.permissions.filter(function(permission) {
				return permission.functionalityId === functionality
			}).length > 0;
		} else {
			return this.isAdmin();
		}
	}
}
