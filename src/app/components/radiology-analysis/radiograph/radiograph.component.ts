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
import {NotificationsService} from 'angular2-notifications';
import {SignsService} from '../../../services/signs.service';
import {assignColorTypeSign, SignType} from '../../../models/SignType';
import {Radiograph} from '../../../models/Radiograph';
import {Sign} from '../../../models/Sign';
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

	public disabled: boolean;
	private subscription: Subscription;

	public isRadiographLoaded: boolean;

	private signTypes: SignType[];
	public radiograph: Radiograph;

	public readonly controlRadiograph = new FileUploadControl(
		{listVisible: true, discardInvalid: true, multiple: false},
		[FileUploadValidators.filesLimit(2)]
	);

	public uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);

	public isLoadingRadiograph: boolean = false;
	public showImageDialog: boolean = false;

	constructor(public localizationService: LocalizationService,
				private notificationService: NotificationService,
				private notificationsService: NotificationsService,
				private signsService: SignsService) { }

	ngOnInit(): void {
		this.isLoadingRadiograph = true;
		this.isRadiographLoaded = false;
		this.disabled = false;
		this.subscription = this.controlRadiograph.valueChanges.subscribe((values: Array<File>) => {
			if (values.length == 2) {
				if (this.extensionValid.includes(values[1].name.split('.').pop())) {
					this.controlRadiograph.setValue([values[1]]);
				} else {
					this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
				}
			} else {
				if (values[0] != undefined) {
					if (this.extensionValid.includes(values[0].name.split('.').pop())) {
						this.uploadedFile = this.loadRadiograph(values[0]);
						this.uploadedFile.subscribe(event => {
							this.isLoadingRadiograph = (event == null);
						});
						this.notificationService.success("The " + this.typeExploration + " radiograph has been upload correctly", "Radiograph upload successfull")
					} else {
						this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
						this.controlRadiograph.setValue([]);
					}
				}
			}
		});
		this.getSignTypes();
		this.radiograph = new Radiograph();
	}

	public addRadiograph(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}
		const file = input.files[0];
		if (this.extensionValid.includes(file.name.split('.').pop())) {
			this.controlRadiograph.setValue([file]);
		} else {
			this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
		}
	}

	public removeRadiograph(): void {
		this.isRadiographLoaded = false;
		this.controlRadiograph.removeFile(this.controlRadiograph.value[0])
	}

	private loadRadiograph(file: File): BehaviorSubject<string> {
		let uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);
		if (file != undefined) {
			const fr = new FileReader();
			fr.onload = async (e) =>  {
				uploadedFile.next(e.target.result.toString());
				this.radiograph = new Radiograph();
				this.radiograph.type = this.typeExploration;
				this.radiograph.source = e.target.result.toString();
				let signInitial = new Sign();
				signInitial.type = this.signTypes.filter(signType => signType.code.includes("NOF"))[0];
				signInitial.id = signInitial.type.code;

				this.radiograph.signs = [signInitial];


				this.isRadiographLoaded = true;

				this.radiographHandler.emit(this.radiograph);
			};
			fr.readAsDataURL(file);
		} else {
			uploadedFile.next(null);
			this.radiographHandler.emit(null);
		}
		return uploadedFile;
	}

	public onPaste(event: any): any {
		if (navigator.clipboard) {
			let anyNavigator: any;
			anyNavigator = window.navigator;

			anyNavigator.clipboard.read()
				.then(clipboardItems => {
					let item = clipboardItems[0];
					if (item.types.includes("image/png")) {
						item.getType("image/png").then((imagePasted): void => {
							imagePasted.lastModifiedDate = new Date();
							imagePasted.name = this.typeExploration.concat(".png");
							let file: File = <File> imagePasted;
							this.controlRadiograph.setValue([file]);
						})
					} else {
						this.notificationService.error("The copied report has not the correct format", "Report loaded failed");
					}
				})
				.catch((error: string) => {
					this.notificationService.error("The copied report has not the correct format", "Report loaded failed");
				});
		} else {
			this.notificationService.error("The clipboard is not enabled", "Failed to access the clipboard");
		}
	}

	public openDialogImage(disabled : boolean = false): void {
		this.notificationsService.remove();
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

	private getSignTypes() {
		this.signsService.getSignTypes().subscribe(signTypes =>
			this.signTypes = signTypes
		)
	}

	public assignColorTypeSign(signType: SignType, colorSecondary: boolean = false): string {
		return assignColorTypeSign(signType, colorSecondary);
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
