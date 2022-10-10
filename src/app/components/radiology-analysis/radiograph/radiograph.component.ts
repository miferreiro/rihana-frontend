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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NotificationsService} from 'angular2-notifications';
import {ExplorationsService} from '../../../services/explorations.service';
import {SignTypesService} from '../../../services/sign-types.service';
import {SignType} from '../../../models/SignType';
import {Radiograph} from '../../../models/Radiograph';
import {Sign} from '../../../models/Sign';
import {AnnotationResult} from '../../locate-signs-in-image-dialog/locate-signs-in-image-dialog.component';
import {LocalizationService} from '../../../modules/internationalization/localization.service';
import {NotificationService} from '../../../modules/notification/services/notification.service';
import {EnumUtils} from '../../../utils/enum.utils';

export enum STATE {
	NOT_LOADED = "NOT_LOADED",
	RADIOGRAPH_LOADED = "RADIOGRAPH_LOADED",
	CLIPBOARD_LOADED = "CLIPBOARD_LOADED",
	EXPLORATION_LOADED = "EXPLORATION_LOADED",
	READ_ONLY = "READ_ONLY"
}

@Component({
	selector: 'app-radiograph',
	templateUrl: './radiograph.component.html',
	styleUrls: ['./radiograph.component.css']
})
export class RadiographComponent implements OnInit {

	@Input() typeExploration: string;

	@Output() radiographHandler = new EventEmitter<Radiograph>();

	public STATEValues: STATE[];
	public _radiograph: Radiograph;
	public isRadiographLoaded: boolean;
	public signTypesRadiograph: SignType[];
	public readonly controlRadiograph = new FileUploadControl(
		{listVisible: true, discardInvalid: true, multiple: false},
		[FileUploadValidators.filesLimit(2)]
	);
	public uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);
	public isLoadingRadiograph: boolean = false;
	public showImageDialog: boolean = false;
	public watchMode: boolean;
	public state: STATE = STATE.NOT_LOADED;

	private readonly extensionValid = ['png', 'jpg', 'jpeg'];
	private subscription: Subscription;
	private signTypes: SignType[];

	constructor(public localizationService: LocalizationService,
				private notificationService: NotificationService,
				private notificationsService: NotificationsService,
				private explorationsService: ExplorationsService,
				private signTypesService: SignTypesService) { }

	ngOnInit(): void {
		this.STATEValues = EnumUtils.enumValues(STATE);
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
						if (!this.watchMode) {
							this.notificationService.success("The " + this.typeExploration + " radiograph has been upload correctly", "Radiograph upload successfull")
						}
					} else {
						this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)", "File upload failed");
						this.controlRadiograph.setValue([]);
					}
				}
			}
		});

		if (this.radiograph != null) {
			this.watchMode = true;
			this.isLoadingRadiograph = false;
			this.isRadiographLoaded = true;
			let contentType = this.radiograph.source.split(",")[0];
			let b64Data = this.radiograph.source.split(",")[1];
			let blob = this.b64toBlob(b64Data, contentType)
			let file: File = new File([blob], this.radiograph.type + ".png");
			this.controlRadiograph.setValue([file]);
			if (this.explorationsService.getEditingExploration()) {
				this.state = STATE.EXPLORATION_LOADED;
			} else {
				this.state = STATE.READ_ONLY;
			}
		} else {
			this.watchMode = false;
			this.isLoadingRadiograph = true;
			this.isRadiographLoaded = false;
			this.state = STATE.NOT_LOADED;
		}

		this.getSignTypes();
	}

	get radiograph(): Radiograph {
		return this._radiograph;
	}

	@Input() set radiograph(radiograph: Radiograph) {
		this._radiograph = radiograph;
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
			this.notificationService.error("The file does not have the correct extension (.png, .jpg or .jpeg)",
										   "File upload failed");
		}
	}

	public removeRadiograph(): void {
		this.isRadiographLoaded = false;
		this.isLoadingRadiograph = true;
		this.radiograph = undefined;
		this.controlRadiograph.removeFile(this.controlRadiograph.value[0])
		this.state = STATE.NOT_LOADED;
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
							this.state = STATE.CLIPBOARD_LOADED;
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

	public openDialogImage(): void {
		this.notificationsService.remove();
		this.showImageDialog = true;
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
		this.updateSignTypesRadiograph();
		document.getElementsByTagName("body")[0].style.overflow = "auto";
	}

	public updateSignTypesRadiograph(): void {
		this.signTypesRadiograph = this.radiograph.signs.map((item): SignType => item.type)
														.filter((value, index, self): boolean =>
														 	self.findIndex(type => type.code == value.code) === index);
	}

	public getNumSignType(signType: SignType): number {
		return this.radiograph.signs.filter(sign => sign.type.code == signType.code).length;
	}

	public checkState(state: string) {
		return this.state == EnumUtils.findKeyForValue(STATE, state);
	}

	private getSignTypes() {
		this.signTypesService.getSignTypes().subscribe(signTypes => {
			this.signTypes = signTypes
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the sign types. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve sign types");
		});
	}

	public getDefaultSign(): string {
		return this.signTypesService.getDefaultSign();
	}

	private loadRadiograph(file: File): BehaviorSubject<string> {
		let uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);
		if (file != undefined) {
			const fr = new FileReader();
			fr.onload = async (e) =>  {
				uploadedFile.next(e.target.result.toString());
				if (this.radiograph == undefined) {
					this.radiograph = new Radiograph();
					this.radiograph.type = this.typeExploration;
					this.radiograph.source = e.target.result.toString();
					let signInitial = new Sign();
					signInitial.type = this.signTypes.filter(signType => signType.code.includes(this.getDefaultSign()))[0];

					this.radiograph.signs = [signInitial];

					this.isRadiographLoaded = true;

					this.radiographHandler.emit(this.radiograph);
					this.state = STATE.RADIOGRAPH_LOADED;
				}
				this.updateSignTypesRadiograph();
			};
			fr.readAsDataURL(file);
		} else {
			uploadedFile.next(null);
			this.radiographHandler.emit(null);
		}
		return uploadedFile;
	}

	private b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
		this.uploadedFile.unsubscribe();
	}
}
