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

import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Sign} from '../../models/Sign';
import {assignColorTypeSign, SignType} from '../../models/SignType';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {SignsService} from '../../services/signs.service';

export class AnnotationResult {
	readonly cancelled: boolean;
	readonly signs?: Sign[];
}

@Component({
	selector: 'app-locate-signs-in-image-dialog',
	templateUrl: './locate-signs-in-image-dialog.component.html',
	styleUrls: ['./locate-signs-in-image-dialog.component.css']
})
export class LocateSignsInImageDialogComponent implements OnInit {

	@Input() src: string;
	@Input() signs: Sign[];
	@Input() disabled: boolean;
	@Output() close = new EventEmitter<AnnotationResult>();

	public showSelectSignType: boolean = false;

	public isLoadingRadiology: boolean = false;
	public scaleFactorImage: number = 1;

	public brightness: string;
	public contrast: string;
	public reseted: boolean;

	public signTypes: SignType[];
	public newSign: Sign;

	constructor(public localizationService: LocalizationService,
				private signService: SignsService) { }

	ngOnInit(): void {
		this.brightness = '100';
		this.contrast = '100';
		this.reseted = false;
		this.signService.getSignTypes().subscribe(signTypes => {
			this.signTypes = signTypes;
		})
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
		this.reseted = true;
	}

	public listSignTypes(): SignType[] {
		return this.signTypes;
	}

	public signsType(signType: SignType): Sign[] {
		return this.signs.filter(sign => sign.type.code === signType.code);
	}

	public checkRenderSomeSingType(signType: SignType): boolean {
		return this.signsType(signType).some(s => s.render)
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
		let index = this.signsType(signType).length;
		this.newSign.id = signType.code + index;
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

	public assignColorTypeSign(signType: SignType, colorSecondary: boolean = false): string {
		return assignColorTypeSign(signType, colorSecondary);
	}
}
