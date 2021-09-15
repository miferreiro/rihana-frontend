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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {BehaviorSubject, Subscription} from 'rxjs';
import {assignColorTypeSign, SignType} from '../../../models/SignType';
import {Radiograph} from '../../../models/Radiograph';
import {AnnotationResult} from '../../locate-signs-in-image-dialog/locate-signs-in-image-dialog.component';
import {LocalizationService} from '../../../modules/internationalization/localization.service';
import {NotificationService} from '../../../modules/notification/services/notification.service';

@Component({
  selector: 'app-radiograph',
  templateUrl: './radiograph.component.html',
  styleUrls: ['./radiograph.component.css']
})
export class RadiographComponent implements OnInit {

	private readonly extensionValid = ['png', 'jpg', 'jpeg'];

	@Output() radiographHandler = new EventEmitter<Radiograph>();
	@Input() typeExploration: string;

	public disabled: boolean = false;
	private subscription: Subscription;

	public radiograph: Radiograph;

	public readonly controlRadiography = new FileUploadControl(
		{listVisible: true, discardInvalid: true, multiple: false},
		[FileUploadValidators.filesLimit(2)]
	);

	public uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);

	public isLoadingRadiograph: boolean = false;
	public showImageDialog: boolean = false;

	constructor(public localizationService: LocalizationService,
				private notificationService: NotificationService
		) { }

	ngOnInit(): void {
		this.isLoadingRadiograph = true;
		this.subscription = this.controlRadiography.valueChanges.subscribe((values: Array<File>) => {
			if (values.length == 2) {
				if (this.extensionValid.includes(values[1].name.split('.').pop())) {
					this.controlRadiography.setValue([values[1]]);
				} else {
					this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
				}
			} else {
				if (values[0] != undefined) {
					if (this.extensionValid.includes(values[0].name.split('.').pop())) {
						this.uploadedFile = this.loadRadiography(values[0]);
						this.uploadedFile.subscribe(event => {
							this.isLoadingRadiograph = (event == null);
						});
						this.notificationService.success("The " + this.typeExploration + " radiograph has been upload correctly", "Radiograph upload successfull")
					} else {
						this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
						this.controlRadiography.setValue([]);
					}
				}
			}
		});
		this.radiograph = new Radiograph();
	}

	public addRadiography(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}
		const file = input.files[0];
		if (this.extensionValid.includes(file.name.split('.').pop())) {
			this.controlRadiography.setValue([file]);
		} else {
			this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
		}
	}

	private loadRadiography(file: File): BehaviorSubject<string> {
		let uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);
		if (file != undefined) {
			const fr = new FileReader();
			fr.onload = async (e) =>  {
				uploadedFile.next(e.target.result.toString());
				this.radiograph = new Radiograph();
				this.radiograph.type = this.typeExploration;
				this.radiograph.source = e.target.result.toString();
				this.radiographHandler.emit(this.radiograph);
			};
			fr.readAsDataURL(file);
		} else {
			uploadedFile.next(null);
			this.radiographHandler.emit(null);
		}
		return uploadedFile;
	}

	public openDialogImage(disabled : boolean = false): void {
		this.showImageDialog = true;
		this.disabled  = disabled;
		if (!this.radiograph.signs) {
			this.radiograph.signs = [];
		}
		document.getElementsByTagName("body")[0].style.overflow = "hidden";
	}

	public closeDialogImage(location: AnnotationResult): void {
		this.showImageDialog = false;
		if (!location.cancelled) {
			this.radiograph.signs = location.signs;
			this.radiographHandler.emit(this.radiograph);
		}
		document.getElementsByTagName("body")[0].style.overflow = "auto";
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	public assignColorTypeSign(signType: SignType, colorSecondary: boolean = false): string {
		return assignColorTypeSign(signType, colorSecondary);
	}
}
