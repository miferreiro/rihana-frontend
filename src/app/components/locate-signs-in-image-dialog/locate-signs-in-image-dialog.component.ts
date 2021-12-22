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


import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {Sign} from '../../models/Sign';
import {SignType} from '../../models/SignType';
import {SignTypesService} from '../../services/sign-types.service';
import {ImageAnnotatorComponent} from '../image-annotator/image-annotator.component';

export class AnnotationResult {
	readonly cancelled: boolean;
	readonly signs?: Sign[];
}

@Component({
	selector: 'app-locate-signs-in-image-dialog',
	templateUrl: './locate-signs-in-image-dialog.component.html',
	styleUrls: ['./locate-signs-in-image-dialog.component.css']
})
export class LocateSignsInImageDialogComponent implements OnInit, OnDestroy {

	@ViewChild(ImageAnnotatorComponent) private imageAnnotatorComponent: ImageAnnotatorComponent;

	@Input() src: string;
	@Input() disabled: boolean;
	@Output() close = new EventEmitter<AnnotationResult>();

	private _signs: Sign[];
	private subscription: Subscription;

	public showSelectSignType: boolean = false;

	public isLoadingRadiology: boolean = false;
	public scaleFactorImage: number = 1;

	public brightness: string;
	public contrast: string;

	public signTypes: SignType[];
	public newSign: Sign;

	public signNoFindings: Sign;
	public other: boolean;

	constructor(private notificationService: NotificationService,
				public localizationService: LocalizationService,
				private signTypesService: SignTypesService) { }

	ngOnInit(): void {
		this.brightness = '100';
		this.contrast = '100';

		this.other = this.signs.filter(sing => sing.type.code == "OTH").length > 0;

		this.subscription = this.signTypesService.getSignTypes().subscribe(signTypes => {
			this.signTypes = signTypes;
			this.signNoFindings = new Sign();
			this.signNoFindings.type = this.signTypes.filter(signType => signType.code.includes("NOF"))[0];
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the sign types. Reason: ") + error.error,
										   "Failed to retrieve sign types");
		});
	}

	get signs(): Sign[] {
		return this._signs;
	}

	@Input() set signs(signs: Sign[]) {
		this._signs = [].concat(signs);
	}

	public changeBrightness(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.brightness = input.value;
	}

	public changeContrast(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.contrast = input.value;
	}

	public resetRadiography(): void {
		this.brightness = '100';
		this.contrast = '100';
		this.imageAnnotatorComponent.resetPanZoom();
	}

	public listSignTypes(): SignType[] {
		return this.signTypes;
	}

	public signsType(signType: SignType): Sign[] {
		return this.signs.filter(sign => sign.type.code === signType.code);
	}

	public checkRenderSomeSingType(signType: SignType): boolean {
		return this.signsType(signType).some(s => s.render);
	}

	public setLocationNewSign(newSign: Sign): void {
		if (newSign.location.area() > 0) {
			this.newSign = newSign;
			this.showSelectSignType = true;
		}
	}

	public closeNewSign(): void {
		this.showSelectSignType = false;
	}

	public addSign(signType: SignType): void {
		if (this.signs.filter(sing => sing.type.code == "NOF").length > 0) {
			this.signs = [];
		}

		this.newSign.type = signType;
		this.newSign.render = true;
		this.newSign.brightness = Number(this.brightness) / 100;
		this.newSign.contrast = Number(this.contrast) / 100;

		this.signs.push(this.newSign);
		this.signs = [...this.signs];

		this.newSign = new Sign();

		this.showSelectSignType = false;
		this.resetRadiography();
	}

	public removeSignType(signType: SignType): void {
		this.signs = this.signs.filter(sign => sign.type.code !== signType.code);
		if (this.signs.length == 0) {
			this.signs = [this.signNoFindings];
		}
	}

	public showSignType(signType: SignType, event: Event): void {
		const show = event.target as HTMLInputElement;
		let render = show.className.includes("bi bi-eye-slash");

		this.signs = this.signs.map(sign => {
			if (sign.type.code === signType.code) {
				sign.render = render;
			}
			return sign;
		});
	}

	public removeSign(sign: Sign): void {
		this.signs = this.signs.filter(s => s !== sign);
		if (this.signs.length == 0) {
			this.signs = [this.signNoFindings];
		}
	}

	public showSign(sign: Sign, event: Event): void {
		const show = event.target as HTMLInputElement;
		let render = (show.className === "bi bi-eye-slash");

		this.signs = this.signs.map(s => {
			if (s === sign) {
				s.render = render;
			}
			return s;
		});
	}

	public onSave(): void {
		this.close.emit({
			cancelled: false,
			signs: this.signs
		});
	}

	public onCancel(): void {
		this.close.emit({
			cancelled: true
		});
	}

	public setScaleFactorImage(scaleFactorImage: number): void {
		this.scaleFactorImage = scaleFactorImage;
	}

	public countSignDetected(): number {
		return this.signs.filter(sign => sign.type.code != 'NOF' && sign.type.code != 'OTH').length;
	}

	public checkOther(event: any): void {
		if (event.target.checked) {
			this.other = true;
			let otherSigns = new Sign();
			otherSigns.type = this.signTypes.filter(signType => signType.code.includes("OTH"))[0];

			if (this.signs.filter(sign => sign.type.code.includes("NOF")).length == 1) {
				this.signs = [otherSigns];
			} else {
				this.signs.push(otherSigns);
			}
		} else {
			this.other = false;
			this.signs = this.signs.filter(sign => !sign.type.code.includes("OTH"));
			if (this.signs.length == 0) {
				this.signs = [this.signNoFindings];
			}
		}
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
