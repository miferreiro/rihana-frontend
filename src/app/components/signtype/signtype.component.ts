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

import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SignType} from '../../models/SignType';
import {AuthenticationService} from '../../services/authentication.service';
import {SignTypesService} from '../../services/sign-types.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {ColorPickerControl, ColorsTable} from '@iplab/ngx-color-picker';

@Component({
	selector: 'app-signtype',
	templateUrl: './signtype.component.html',
	styleUrls: ['./signtype.component.css']
})
export class SigntypeComponent implements OnInit, AfterViewChecked {

	@ViewChild('closeBtn') closeBtn: ElementRef;

	creatingSignType = false;
	editingSignType = false;
	deletingSignType = false;
	signType: SignType = new SignType();
	confirmPassword: string;

	// to show the value of the enum
	keys = Object.keys;

	signTypes: SignType[] = [];

	public compactControlPrimaryColor = new ColorPickerControl().hidePresets();
	public compactControlSecondaryColor = new ColorPickerControl().hidePresets();

	constructor(public authenticationService: AuthenticationService,
				private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private signTypesService: SignTypesService) { }

	ngOnInit(): void {
		this.signTypesService.getSignTypes().subscribe(signTypes => {
			this.signTypes = signTypes;
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the sign types. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve sign types");
		});
		this.signType.primaryColor ="#FFFFFF";
		this.signType.secondaryColor ="#000000";
	}

	ngAfterViewChecked(): void {
		document.querySelectorAll("indicator-component").forEach(e =>
			e.setAttribute("title", this.localizationService.translate("Copy color to clipboard"))
		);
	}

	save() {
		if (this.creatingSignType) {
			this.signTypesService.create(this.signType).subscribe((newSignType) => {
				this.signTypes = this.signTypes.concat(newSignType);
				this.notificationService.success("Sign type registered successfully",
												 "Sign type registered");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error registering the sign types. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to register the sign types");
			});
		} else {
			this.signTypesService.editSignType(this.signType).subscribe((updated) => {
				Object.assign(this.signTypes.find((signType) => signType.code === this.signType.code), updated);

				this.notificationService.success("Sign type edited successfully",
												 "Sign type edited");
				this.cancel();
			}, error => {
				this.notificationService.error(this.localizationService.translate("Error editing the sign types. Reason: ") +
											   this.localizationService.translate(error.error),
											   "Failed to edit the sign types");
			});
		}
	}

	cancel() {
		this.creatingSignType = false;
		this.editingSignType = false;
		this.deletingSignType = false;
		this.signType = new SignType();
		this.signType.primaryColor ="#FFFFFF";
		this.signType.secondaryColor ="#000000";
		this.closeBtn.nativeElement.click();
	}

	edit(code: string) {
		this.editingSignType = true;
		this.signType = new SignType();
		Object.assign(this.signType, this.signTypes.find((signType) => signType.code === code));
	}

	delete(code: string) {
		this.signTypesService.deleteSignType(code).subscribe(() => {
			const index = this.signTypes.indexOf(
				this.signTypes.find((signType) => signType.code === code)
			);
			this.signTypes.splice(index, 1);
			this.notificationService.success("Sign type removed successfully",
											 "Sign type removed");
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error removing the user. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to remove the user");
		});
		this.cancel();
	}

	remove(code: string) {
		this.deletingSignType = true;
		this.signType = this.signTypes.find((signType) => signType.code === code);
	}
}
