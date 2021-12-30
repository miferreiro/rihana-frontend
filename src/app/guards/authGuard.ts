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
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
	constructor(private router: Router,
				private autheticationService: AuthenticationService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

		if (localStorage.getItem('currentUser')) {

			if (route.url.toString() == "explorations" && this.autheticationService.hasFunctionalityPermission(8)) {
				return true;
			}

			if (route.url.toString() == "exploration" && this.autheticationService.hasFunctionalityPermission(8)) {
				return true;
			}

			if (route.url.toString() == "users" && this.autheticationService.hasFunctionalityPermission(1)) {
				return true;
			}

			if (route.url.toString() == "singtypes" && this.autheticationService.hasFunctionalityPermission(11)) {
				return true;
			}

			if (route.url.toString() == "actions" && this.autheticationService.hasFunctionalityPermission(3)) {
				return true;
			}

			if (route.url.toString() == "functionalities" && this.autheticationService.hasFunctionalityPermission(4)) {
				return true;
			}

			if (route.url.toString() == "roles" && this.autheticationService.hasFunctionalityPermission(2)) {
				return true;
			}

			if (route.url.toString() == "functionalityactions" && this.autheticationService.hasFunctionalityPermission(5)) {
				return true;
			}

			if (route.url.toString() == "permissions" && this.autheticationService.hasFunctionalityPermission(6)) {
				return true;
			}

			if (route.url.toString() == "profile" && this.autheticationService.hasPermission(1, 5)) {
				return true;
			}

			this.router.navigate(['/PageNotFound']);
			return false;
		}

		this.router.navigate(['/login'], {
			queryParams: {
				return: state.url
			}
		});
		return false;
	}
}