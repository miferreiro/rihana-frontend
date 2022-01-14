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
import {Role} from '../../models/Role';
import {AuthenticationService} from '../../services/authentication.service';
import {RolesService} from '../../services/roles.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-role',
	templateUrl: './role.component.html',
	styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingRole = false;
	editingRole = false;
	deletingRole = false;
	role: Role = new Role();

	roles: Role[] = [];

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private rolesService: RolesService) { }

	ngOnInit(): void {
		this.getRoles();
	}

	getRoles() {
		this.rolesService.getRoles().subscribe(roles => {
			this.roles = roles;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the roles. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve roles");
		});
	}

	save() {
		if (this.creatingRole) {
			this.rolesService.create(this.role).subscribe(newRole => {
				this.getRoles();
				this.notificationService.success("Role registered successfully",
												 "Role registered");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error registering the role. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to register the role");
			});
		} else {
			this.rolesService.editRole(this.role).subscribe(updated => {
				Object.assign(this.roles.find(role => role.name === this.role.name), updated);
				this.notificationService.success("Role edited successfully",
												 "Role edited");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the role. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to edit the role");
			});
		}
	}

	cancel() {
		this.creatingRole = false;
		this.editingRole = false;
		this.deletingRole = false;
		this.role = new Role();
		this.closeBtn.nativeElement.click();
	}

	edit(id: number) {
		this.editingRole = true;
		this.role = new Role();
		Object.assign(this.role, this.roles.find(role => role.id === id));
	}

	delete(id: number | string) {
		this.rolesService.deleteRole(Number(id)).subscribe(() => {
			const index = this.roles.indexOf(
				this.roles.find(role => role.id === Number(id))
			);
			this.roles.splice(index, 1);
			this.notificationService.success("Role removed successfully",
											 "Role removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the role. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to remove the role");
		});
		this.cancel();
	}

	remove(id: number) {
		this.deletingRole = true;
		this.role = this.roles.find(role => role.id === id);
	}
}
