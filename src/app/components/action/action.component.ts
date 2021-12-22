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
import {ActionsService} from '../../services/actions.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-action',
	templateUrl: './action.component.html',
	styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingAction = false;
	editingAction = false;
	deletingAction = false;
	action: Action = new Action();

	actions: Action[] = [];

	constructor(private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private actionsService: ActionsService) { }

	ngOnInit(): void {
		this.getActions();
	}

	getActions() {
		this.actionsService.getActions().subscribe(actions => {
			this.actions = actions;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the actions. Reason: ") + error.error,
										   "Failed to retrieve actions");
		});
	}

	save() {
		if (this.creatingAction) {
			this.actionsService.create(this.action).subscribe(newAction => {
				this.getActions();
				this.notificationService.success("Action registered successfully",
												 "Action registered");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error registering the action. Reason: ") + error.error,
											   "Failed to register the action");
			});
		} else {
			this.actionsService.editAction(this.action).subscribe(updated => {
				Object.assign(this.actions.find(action => action.name === this.action.name), updated);
				this.notificationService.success("Action edited successfully",
												 "Action edited");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the action. Reason: ") + error.error,
											   "Failed to edit the action");
			});
		}
	}

	cancel() {
		this.creatingAction = false;
		this.editingAction = false;
		this.deletingAction = false;
		this.action = new Action();
		this.closeBtn.nativeElement.click();
	}

	edit(id: number) {
		this.editingAction = true;
		this.action = new Action();
		Object.assign(this.action, this.actions.find(action => action.id === id));
	}

	delete(id: number | string) {
		this.actionsService.deleteAction(Number(id)).subscribe(() => {
			const index = this.actions.indexOf(
				this.actions.find(action => action.id === Number(id))
			);
			this.actions.splice(index, 1);
			this.notificationService.success("Action removed successfully",
											 "Action removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the action. Reason: ") + error.error,
										   "Failed to remove the action");
		});
		this.cancel();
	}

	remove(id: number) {
		this.deletingAction = true;
		this.action = this.actions.find(action => action.id === id);
	}
}
