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

	constructor(private authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private locationService: LocalizationService,
				private usersServices: UsersService) { }

	ngOnInit(): void {
		this.user.role = Role.USER;
		this.usersServices.getUsers().subscribe(users => {
			this.users = users;
			const loggedUser = this.users.find((user) => user.login === this.authenticationService.getUser().login);
			this.users.splice(this.users.indexOf(loggedUser), 1);
		});
	}

	save() {
		if (this.creatingUser) {
			this.usersServices.create(this.user).subscribe((newUser) => {
				this.users = this.users.concat(newUser);
				this.notificationService.success(this.locationService.translate('User registered successfully') + '.',
												 this.locationService.translate('User registered'));
				this.cancel();
			});
		} else {
			this.usersServices.editUser(this.user).subscribe(updated => {
				Object.assign(this.users.find((user) => user.login === this.user.login), updated);
				this.notificationService.success(this.locationService.translate('User edited successfully') + '.',
												 this.locationService.translate('User edited'));
				this.cancel();
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

	edit(login: string) {
		this.editingUser = true;
		this.user = new Users();
		Object.assign(this.user, this.users.find((user) => user.login === login));
		// to not show the password in the editing modal
		this.user.password = '';
	}

	delete(login: string) {
		this.usersServices.deleteUser(login).subscribe(() => {
			const index = this.users.indexOf(
				this.users.find((user) => user.login === login)
			);
			this.users.splice(index, 1);
			this.notificationService.success(this.locationService.translate('User removed successfully') + '.',
											 this.locationService.translate('User removed'));
		});
		this.cancel();
	}

	remove(login: string) {
		this.deletingUser = true;
		this.user = this.users.find((user) => user.login === login);
	}
}
