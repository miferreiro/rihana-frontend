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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Functionality} from '../../models/Functionality';
import {AuthenticationService} from '../../services/authentication.service';
import {FunctionalitiesService} from '../../services/functionalities.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-functionality',
	templateUrl: './functionality.component.html',
	styleUrls: ['./functionality.component.css']
})
export class FunctionalityComponent implements OnInit {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingFunctionality = false;
	editingFunctionality = false;
	deletingFunctionality = false;
	functionality: Functionality = new Functionality();

	functionalities: Functionality[] = [];

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private functionalitiesService: FunctionalitiesService) { }

	ngOnInit(): void {
		this.getFunctionalities();
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

	save() {
		if (this.creatingFunctionality) {
			this.functionalitiesService.create(this.functionality).subscribe(newFunctionality => {
				this.getFunctionalities();
				this.notificationService.success("Functionality registered successfully",
												 "Functionality registered");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error registering the functionality. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to register the functionality");
			});
		} else {
			this.functionalitiesService.editFunctionality(this.functionality).subscribe(updated => {
				Object.assign(this.functionalities.find(functionality => functionality.name === this.functionality.name), updated);
				this.notificationService.success("Functionality edited successfully",
												 "Functionality edited");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the functionality. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to edit the functionality");
			});
		}
	}

	cancel() {
		this.creatingFunctionality = false;
		this.editingFunctionality = false;
		this.deletingFunctionality = false;
		this.functionality = new Functionality();
		this.closeBtn.nativeElement.click();
	}

	edit(id: number) {
		this.editingFunctionality = true;
		this.functionality = new Functionality();
		Object.assign(this.functionality, this.functionalities.find(functionality => functionality.id === id));
	}

	delete(id: number | string) {
		this.functionalitiesService.deleteFunctionality(Number(id)).subscribe(() => {
			const index = this.functionalities.indexOf(
				this.functionalities.find(functionality => functionality.id === Number(id))
			);
			this.functionalities.splice(index, 1);
			this.notificationService.success("Functionality removed successfully",
											 "Functionality removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the functionality. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to remove the functionality");
		});
		this.cancel();
	}

	remove(id: number) {
		this.deletingFunctionality = true;
		this.functionality = this.functionalities.find(functionality => functionality.id === id);
	}
}
