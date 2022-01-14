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
import {Action} from '../../models/Action';
import {Functionality} from '../../models/Functionality';
import {Permission} from '../../models/Permission';
import {Role} from '../../models/Role';
import {FunctionalityAction} from '../../models/FunctionalityAction';
import {ActionsService} from '../../services/actions.service';
import {AuthenticationService} from '../../services/authentication.service';
import {FunctionalitiesService} from '../../services/functionalities.service';
import {FunctionalityActionsService} from '../../services/functionality-actions.service';
import {PermissionsService} from '../../services/permissions.service';
import {RolesService} from '../../services/roles.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-permission',
	templateUrl: './permission.component.html',
	styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingPermission = false;
	permission: Permission = new Permission();

	permissions: Permission[] = [];

	roles: Role[] = [];
	functionalityActions: FunctionalityAction[] = [];
	functionalities: Functionality[] = [];
	actions: Action[] = [];

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private permissionsService: PermissionsService,
				private rolesService: RolesService,
				private functionalityActionsService: FunctionalityActionsService,
				private functionalitiesService: FunctionalitiesService,
				private actionsService: ActionsService) { }

	ngOnInit() {
		this.getPermissions();
		this.getRoles();
		this.getFunctionalityActions();
		this.getFunctionalities();
		this.getActions();
	}

	getPermissions() {
		this.permissionsService.getPermissions().subscribe(permissions => {
			this.permissions = permissions;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the permissions. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve permissions");
		});
	}

	getRoles() {
		this.rolesService.getRoles().subscribe(roles => {
			this.roles = roles;
			const index = this.roles.indexOf(
				this.roles.find(role => role.name === "ADMIN")
			);
			this.roles.splice(index, 1);
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the roles. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve roles");
		});
	}

	getFunctionalityActions() {
		this.functionalityActionsService.getFunctionalityActions().subscribe(functionalityActions => {
			this.functionalityActions = functionalityActions;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the functionality-actions. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve functionality-actions");
		});
	}

	getFunctionalities() {
		this.functionalitiesService.getFunctionalities().subscribe(functionalities => {
			this.functionalities = functionalities;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the functionalities. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve functionalities");
		});
	}

	getActions() {
		this.actionsService.getActions().subscribe(actions => {
			this.actions= actions;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the actions. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve actions");
		});
	}

	getRole(id: number): Role {
		return this.roles.find(role => role.id === id);
	}

	getFunctionality(id: number): Functionality {
		return this.functionalities.find(functionality => functionality.id === id);
	}

	getAction(id: number): Action {
		return this.actions.find(action => action.id === id);
	}

	save() {
		this.permissionsService.create(this.permission).subscribe(newPermission => {
			this.getPermissions();
			this.notificationService.success("Permission registered successfully",
											 "Permission registered");
			this.cancel();
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error registering the permission. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to register the permission");
		});
	}

	cancel() {
		this.creatingPermission = false;
		this.permission = new Permission();
		this.closeBtn.nativeElement.click();
	}

	delete(roleId: number | string, functionalityAction: FunctionalityAction) {
		this.permissionsService.deletePermission(Number(roleId), Number(functionalityAction.functionalityId),
												 Number(functionalityAction.actionId)).subscribe(() => {
			const index = this.permissions.indexOf(
				this.permissions.find(permission => permission.roleId === Number(roleId) &&
													permission.functionalityAction.functionalityId === Number(functionalityAction.functionalityId) &&
													permission.functionalityAction.actionId === Number(functionalityAction.actionId))
			);
			this.permissions.splice(index, 1);
			this.notificationService.success("Permission removed successfully",
											 "Permission removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the permission. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to remove the permission");
		});
		this.cancel();
	}
}
