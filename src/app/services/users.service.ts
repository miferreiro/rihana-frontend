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
import {User} from '../models/User';
import {Users} from "../models/Users";
import {UserInfo} from "./entities/UserInfo";

@Injectable({
	providedIn: 'root'
})
export class UsersService {

	constructor(private http: HttpClient) {
	}

	getUsers(): Observable<Users[]> {
		return this.http.get<UserInfo[]>(`${environment.restApi}/user/`).pipe(
		  	map((users) => users.map(this.mapUserInfo.bind(this)))
		);
	}

	getUser(login: string): Observable<Users> {
		return this.http.get<UserInfo[]>(`${environment.restApi}/user/${login}`).pipe(
			map(this.mapUserInfo.bind(this))
		);
	}

	create(user: Users): Observable<Users> {
		const userInfo = this.toUserInfo(user);

		return this.http.post<UserInfo>(`${environment.restApi}/user`, userInfo).pipe(
			map(this.mapUserInfo.bind(this))
		);
	}

	editUser(user: Users): Observable<User> {
		const userInfo = this.toEditUserInfo(user);
		return this.http.put<UserInfo>(`${environment.restApi}/user/${user.login}`, userInfo).pipe(
			map(this.mapUserInfo.bind(this))
		);
	}

	deleteUser(login: string) {
		return this.http.delete(`${environment.restApi}/user/${login}`);
	}

	private toUserInfo(user: Users): UserInfo {
		return {
			login: user.login,
			password: user.password,
			role: user.role
		};
	}

	private toEditUserInfo(user: Users): UserInfo {
		return {
			login: user.login,
			password: user.password,
			role: user.role
		};
	}

	private mapUserInfo(userInfo: UserInfo): Users {
		return {
			login: userInfo.login,
			password: userInfo.password,
			role: userInfo.role
		};
	}
}