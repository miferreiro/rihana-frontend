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
import {FunctionalityAction} from '../../models/FunctionalityAction';
import {ActionsService} from '../../services/actions.service';
import {FunctionalitiesService} from '../../services/functionalities.service';
import {FunctionalityActionsService} from '../../services/functionality-actions.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-functionality-action',
	templateUrl: './functionality-action.component.html',
	styleUrls: ['./functionality-action.component.css']
})
export class FunctionalityactionComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingFunctionalityAction = false;
	functionalityAction: FunctionalityAction = new FunctionalityAction();

	functionalityActions: FunctionalityAction[] = [];

	functionalities: Functionality[] = [];
	actions: Action[] = [];

	constructor(private notificationService: NotificationService,
				private locationService: LocalizationService,
				private functionalityActionsService: FunctionalityActionsService,
				private functionalitiesService: FunctionalitiesService,
				private actionsService: ActionsService) { }

	ngOnInit() {
		this.getFunctionalityActions();
		this.getFunctionalities();
		this.getActions();
	}

	getFunctionalityActions() {
		this.functionalityActionsService.getFunctionalityActions().subscribe(functionalityActions => {
			this.functionalityActions = functionalityActions;
		});
	}

	getFunctionalities() {
		this.functionalitiesService.getFunctionalities().subscribe(functionalities => {
			this.functionalities = functionalities;
		});
	}

	getActions() {
		this.actionsService.getActions().subscribe(actions => {
			this.actions= actions;
		});
	}

	getFunctionality(id: number): Functionality {
		return this.functionalities.find(functionality => functionality.id === id);
	}

	getAction(id: number): Action {
		return this.actions.find(action => action.id === id);
	}

	save() {
		this.functionalityActionsService.create(this.functionalityAction).subscribe(newFunctionalityAction => {
			this.getFunctionalityActions();
			this.notificationService.success(this.locationService.translate('Functionality-action registered successfully') + '.',
											 this.locationService.translate('Functionality-action registered'));
			this.cancel();
		});
	}

	cancel() {
		this.creatingFunctionalityAction = false;
		this.functionalityAction = new FunctionalityAction();
		this.closeBtn.nativeElement.click();
	}

	delete(functionalityId: number | string, actionId: number | string) {
		this.functionalityActionsService.deleteFunctionalityAction(Number(functionalityId), Number(actionId)).subscribe(() => {
			const index = this.functionalityActions.indexOf(
				this.functionalityActions.find(functionalityAction => functionalityAction.functionalityId === Number(functionalityId) &&
																	  functionalityAction.actionId === Number(actionId))
			);
			this.functionalityActions.splice(index, 1);
			this.notificationService.success(this.locationService.translate('Functionality-action removed successfully') + '.',
											 this.locationService.translate('Functionality-action removed'));
		});
		this.cancel();
	}
}
