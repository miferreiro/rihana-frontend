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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Role} from '../../models/User';
import {Users} from '../../models/Users';
import {AuthenticationService} from '../../services/authentication.service';
import {UsersService} from '../../services/users.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingUser = false;
	editingUser = false;
	deletingUser = false;
	user: Users = new Users();
	confirmPassword: string;

	roles = Role;
	// to show the value of the enum
	keys = Object.keys;

	users: Users[] = [];

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private usersService: UsersService) { }

	ngOnInit(): void {
		this.user.role = Role.USER;
		this.getUsers();
	}

	getUsers() {
		this.usersService.getUsers().subscribe(users => {
			this.users = users;
			const loggedUser = this.users.find((user) => user.login === this.authenticationService.getUser().login);
			this.users.splice(this.users.indexOf(loggedUser), 1);
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the users. Reason: ") + this.localizationService.translate(error.error),
										   "Failed to retrieve users");
		});
	}

	save() {
		if (this.creatingUser) {
			this.usersService.create(this.user).subscribe((newUser) => {
				this.users = this.users.concat(newUser);
				this.notificationService.success("User registered successfully",
												 "User registered");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error registering the users. Reason: ") + this.localizationService.translate(error.error),
											   "Failed to register the user");
			});
		} else {
			this.usersService.editUser(this.user).subscribe(updated => {
				Object.assign(this.users.find((user) => user.login === this.user.login), updated);
				this.notificationService.success("User edited successfully",
												 "User edited");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the user. Reason: ") + this.localizationService.translate(error.error),
											   "Failed to edit the user");
			});
		}
	}

	cancel() {
		this.creatingUser = false;
		this.editingUser = false;
		this.deletingUser = false;
		this.user = new Users();
		this.user.role = Role.USER;
		this.closeBtn.nativeElement.click();
	}


	create() {
		this.creatingUser = true
		this.user.role = Role.USER;
	}

	edit(login: string) {
		this.editingUser = true;
		this.user = new Users();
		Object.assign(this.user, this.users.find((user) => user.login === login));
		// to not show the password in the editing modal
		this.user.password = '';
	}

	delete(login: string) {
		this.usersService.deleteUser(login).subscribe(() => {
			const index = this.users.indexOf(
				this.users.find((user) => user.login === login)
			);
			this.users.splice(index, 1);
			this.notificationService.success("User removed successfully",
											 "User removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the user. Reason: ") + this.localizationService.translate(error.error),
										   "Failed to remove the user");
		});
		this.cancel();
	}

	remove(login: string) {
		this.deletingUser = true;
		this.user = this.users.find((user) => user.login === login);
	}
}
