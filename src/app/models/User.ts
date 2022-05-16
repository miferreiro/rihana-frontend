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

import {FunctionalityAction} from "./FunctionalityAction";

export class User {
	private _login: string;
	private _password: string;
	private _role: Role;
	private _permissions: FunctionalityAction[];
	private _authHeader: string;
	private _authenticated: boolean;
	private _expiry: number;

	constructor() {
		const user: User = JSON.parse(localStorage.getItem('currentUser'));
		if (user != null) {
			this._role = user._role;
			this._login = user._login;
			this._password = user._password;
			this._permissions = user._permissions;
			this._authenticated = user._authenticated;
			this._authHeader = user._authHeader;
			this._expiry = user._expiry;
		} else {
			this._authenticated = false;
			this._role = null;
			this._permissions = [];
		}
	}

	get authHeader(): string {
		return this._authHeader;
	}

	set authHeader(value: string) {
		this._authHeader = value;
	}

	get authenticated(): boolean {
		return this._authenticated;
	}

	set authenticated(value: boolean) {
		this._authenticated = value;
	}

	get role(): Role {
		return this._role;
	}

	set role(value: Role) {
		this._role = value;
	}

	get login(): string {
		return this._login;
	}

	set login(value: string) {
		this._login = value;
	}

	get password(): string {
		return this._password;
	}

	set password(value: string) {
		this._password = value;
	}

	get permissions(): FunctionalityAction[] {
		return this._permissions;
	}

	set permissions(value: FunctionalityAction[]) {
		this._permissions = value;
	}

	get expiry(): number {
		return this._expiry;
	}

	set expiry(expiry: number) {
		this._expiry = expiry;
	}

	public save() {
		const now = new Date();
		this._expiry = now.getTime() + 604800000;
		localStorage.setItem('currentUser', JSON.stringify(this));
	}

	public clear() {
		localStorage.removeItem('currentUser');
	}
}

export enum Role {
	ADMIN = 'ADMIN',
	USER = 'USER',
	RADIOLOGIST = 'RADIOLOGIST',
	SUPERVISOR = 'SUPERVISOR'
}