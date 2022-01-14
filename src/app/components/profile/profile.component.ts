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

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {UsersService} from '../../services/users.service';
import {Users} from '../../models/Users';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	loggedUser: Users = new Users();
	password: string;
	confirmPassword: string;
	editingUser = false;

	constructor(private authenticationService: AuthenticationService,
				public localizationService: LocalizationService,
				private notificationService: NotificationService,
				private usersService: UsersService) { }

	ngOnInit(): void {
		if (this.authenticationService.getUser().authenticated) {
			this.usersService.getUser(this.authenticationService.getUser().login).subscribe(user => {
				this.loggedUser = user;
				this.loggedUser.password = '';
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error retrieving the user info. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to retrieve user info");
			});
		}
	}

	edit() {
		this.editingUser = true;
		// to not show the password in the edition
		this.loggedUser.password = '';
	}

	editUser() {
		if (this.loggedUser.password !== '') {
			this.usersService.editUser(this.loggedUser).subscribe(updatedUser => {
				this.editingUser = false;
				if (this.loggedUser.password !== '') {
					this.authenticationService.logOut();
					this.authenticationService.logIn(this.loggedUser.login, this.loggedUser.password, this.loggedUser.role);
				}
				Object.assign(this.loggedUser, updatedUser);
				this.loggedUser.password = '';
				this.confirmPassword = '';
				this.notificationService.success("User edited successfully",
												 "User edited");
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the user. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to edit the user");
			});
		} else {
			this.editingUser = false;
		}
	}

	switchLang(lang: string) {
		this.localizationService.useLanguage(lang);
		localStorage.setItem('language', lang);
		window.location.reload()
	}
}
