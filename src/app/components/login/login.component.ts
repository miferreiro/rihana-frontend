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

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Role} from '../../models/User';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	login: string;
	password: string;
	return = '';

	constructor(private authenticationService: AuthenticationService,
				private route: ActivatedRoute,
				private router: Router) {
	}

	ngOnInit() {
		this.route.queryParams
		  .subscribe(params => this.return = params['return'] || '');
	}

	logIn() {
		this.authenticationService.checkCredentials(this.login, this.password).subscribe(async (role) => {
			await this.authenticationService.logIn(this.login, this.password, role);
			if (role == Role.USER) {
				this.router.navigateByUrl('home');
			} else {
				this.router.navigateByUrl('explorations');
			}

		});
	}
}