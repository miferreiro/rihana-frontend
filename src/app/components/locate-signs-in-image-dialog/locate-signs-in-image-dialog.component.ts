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
import {DecimalPipe} from '@angular/common';
import {PixelsToMmsPipe} from '../../pipes/pixels-to-mms.pipe';
import {EnumUtils} from '../../utils/enum.utils';
import {assignColorTypeSign, Sign, SIGNTYPE} from '../../models/Sign';
import {LocalizationService} from '../../modules/internationalization/localization.service';

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
	@Output() close = new EventEmitter<AnnotationResult>();

	public showSelectSignType: boolean = false;

	public isLoadingRadiology: boolean = false;
	public scaleFactorImage: number = 1;

	public brightness: string = '100';
	public contrast: string = '100';
	public zoom: string = '0';

	public SIGNValues: SIGNTYPE[];
	public signs: Sign[];
	public newSign: Sign;

	constructor(public localizationService: LocalizationService,
				private _decimalPipe: DecimalPipe,
				private _pixelsToMms: PixelsToMmsPipe) { }

	ngOnInit(): void {
		this.brightness = '100';
		this.contrast = '100';
		this.zoom = '0';

		this.SIGNValues = EnumUtils.enumValues(SIGNTYPE);
		this.signs = [];
		this.scaleFactorImage = 1;
	}

	public changeBrightness(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.brightness = input.value;
	}

	public changeContrast(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.contrast = input.value;
	}

	public changeZoom(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.zoom = input.value;
	}

	public resetRadiography(): void {
		this.brightness = '100';
		this.contrast = '100';
		this.zoom = '0';
	}

	public listSignTypes(): SIGNTYPE[] {
		return Object.values(SIGNTYPE).filter (x => x !== SIGNTYPE.NO_FINDING);
	}

	public signsType(signType: string): Sign[] {
		let signKey = EnumUtils.findKeyForValue(SIGNTYPE, signType);
		return this.signs.filter(sign => sign.type === SIGNTYPE[signKey]);
	}

	public checkRenderSomeSingType(signType: string): boolean {
		return this.signsType(signType).some(s => s.render)
	}

	public setLocationNewSign(newSign: Sign): void {
		if (newSign.location.area() > 0) {
			this.newSign = newSign;
			this.showSelectSignType = true;
		}
	}

	public addSign(signType: string): void {
		let signKey = EnumUtils.findKeyForValue(SIGNTYPE, signType);

		let index = this.signsType(signType).length;
		this.newSign.id = signKey.substr(0, 3) + index;
		this.newSign.type = SIGNTYPE[signKey];
		this.newSign.render = true;

		this.signs.push(this.newSign);
		this.signs = [...this.signs];

		this.onResize();
		this.newSign = new Sign();

		this.showSelectSignType = false;
	}

	public cleanSignType(signType: string): void {
		this.signs = this.signs.filter(sign => sign.type !== signType);
		this.refreshContextOptions();
	}

	public showSignType(signType: string, event: Event): void {
		const show = event.target as HTMLInputElement;
		let signKey = EnumUtils.findKeyForValue(SIGNTYPE, signType);
		let render = (show.className === "bi bi-eye-slash");

		this.signs = this.signs.map(sign => {
			if (sign.type === SIGNTYPE[signKey]) {
				sign.render = render;
			}
			return sign;
		});
		this.onResize();
	}

	public cleanSign(sign: Sign): void {
		this.signs = this.signs.filter(s => s !== sign);
		this.refreshContextOptions();
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
		this.onResize();
	}

	public onSave(): void {
		this.closePopovers();
		this.close.emit({
			cancelled: false,
			signs: this.signs
		});
	}

	public onCancel(): void {
		this.closePopovers();
		this.close.emit({
			cancelled: true
		});
	}

	@HostListener('window:resize')
	onResize() {
		this.refreshContextOptions();
	}

	public setScaleFactorImage(scaleFactorImage: number): void {
		this.scaleFactorImage = scaleFactorImage;
	}

	private refreshContextOptions(): void {
		let div = document.getElementById("image-annotator");
		let nodes = div.getElementsByTagName("i");
		for (var i = nodes.length; i--; ){
			nodes[i].remove();
		}
		nodes = div.getElementsByTagName("i");
		for (let sign of this.signs) {
			if (sign.render) {
				let x = document.createElement("i");
				let loc = sign.location;
				let canvasDim = document.querySelector("canvas");

				x.className = "bi bi-x";
				x.addEventListener('click', (e:Event) => this.cleanSign(sign));
				x.setAttribute("style", "font-size:1rem;width:1rem;height:1rem;color:" +
										assignColorTypeSign(sign.type) + ";position:absolute;left:calc(" +
										(canvasDim.offsetLeft + window?.scrollX + (loc.x * this.scaleFactorImage) +
										(loc.width * this.scaleFactorImage)) + "px - .8rem);top:calc(" +
										(canvasDim.offsetTop + window?.scrollY + (loc.y * this.scaleFactorImage)) + "px - 1.1rem)");

				div.appendChild(x);

				let question = document.createElement("i");

				question.className = "bi bi-question";
				question.setAttribute("style", "font-size:1rem;width:1rem;height:1rem;color:" +
												assignColorTypeSign(sign.type) + ";position:absolute;left:calc(" +
												(canvasDim.offsetLeft + window?.scrollX + (loc.x * this.scaleFactorImage) +
												(loc.width * this.scaleFactorImage)) + "px - 1.5rem);top:calc(" +
												(canvasDim.offsetTop + window?.scrollY + (loc.y * this.scaleFactorImage)) + "px - 1.1rem)");

				question.setAttribute("data-bs-toggle", "popover");
				question.setAttribute("data-bs-placement", "top");
				question.setAttribute("data-bs-title", sign.id);

				question.setAttribute("data-bs-content",
										this.localizationService.translate("Area") + ": " +
										this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.area()), '1.0-0', this.localizationService.getCurrentLocaleId()) +
										"mm²<br>x: " +
										this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.x), '1.0-0', this.localizationService.getCurrentLocaleId()) +
										"mm<br>y: " +
										this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.y), '1.0-0', this.localizationService.getCurrentLocaleId()) +
										"mm<br>" + this.localizationService.translate("Width") + ": " +
										this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.width), '1.0-0', this.localizationService.getCurrentLocaleId()) +
										"mm<br>" + this.localizationService.translate("Height") + ": " +
										this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.height), '1.0-0', this.localizationService.getCurrentLocaleId()) +
										"mm");
				div.appendChild(question);
			}
		}
	}

	public assignColorTypeSign(signType: SIGNTYPE): string {
		return assignColorTypeSign(signType);
	}

	private closePopovers(): void {
		let popovers = document.getElementsByClassName("popover");
		for (var i = popovers.length; i--; ){
			popovers[i].remove();
		}
	}
}
