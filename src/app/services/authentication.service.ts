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
import {environment} from '../../environments/environment';
import {Role, User} from '../models/User';
import {Observable} from 'rxjs';
import {RihanaError} from '../modules/notification/entities';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

	private user: User = new User();

	constructor(private  http: HttpClient) {
	}

	checkCredentials(login: string, password: string): Observable<Role> {
		this.user.login = login;
		this.user.password = password;
		return this.http.get<Role>(`${environment.restApi}/user/${login}/role`)
		.pipe(
			RihanaError.throwOnError('Failed to login', `User or password incorrect. Please try again.`)
		);
	}

	public logIn(login: string, password: string, role: Role) {
		this.user.login = login;
		this.user.password = password;
		this.user.role = role;
		this.user.authHeader = this.getAuthorizationHeader();
		this.user.authenticated = true;
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
}
