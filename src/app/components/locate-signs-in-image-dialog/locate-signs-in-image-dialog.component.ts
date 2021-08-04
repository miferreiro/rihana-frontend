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
		this.checkPopovers();
		let div = document.getElementById("image-annotator");

		let removeElements = (elements: HTMLCollectionOf<Element>) => {
			for (var i = elements.length; i--; ){
				elements[i].remove();
			}
		};
		removeElements(div.getElementsByTagName("i"));
		removeElements(div.getElementsByClassName("hoverZone"));
		removeElements(div.getElementsByClassName("signIdDiv"));

		for (let sign of this.signs) {
			if (sign.render) {
				let canvasDim = document.querySelector("canvas");
				let loc = sign.location;

				let signIdDiv = document.createElement("div");
				signIdDiv.className = "signIdDiv text-wrap";
				signIdDiv.textContent = sign.id;

				let top: number;
				let left = (canvasDim.parentElement.offsetLeft + (loc.x * this.scaleFactorImage));

				if (((loc.y + loc.height) * this.scaleFactorImage + 16 ) > canvasDim.height) {
					top = (canvasDim.offsetTop + (loc.y * this.scaleFactorImage) - 16);
				} else {
					top = (canvasDim.offsetTop + (loc.y * this.scaleFactorImage) + (loc.height * this.scaleFactorImage));
				}

				signIdDiv.setAttribute("style", "left:" + (left - 1) + "px;top:" + top + "px;width: fit-content;" +
												"background-color:" + assignColorTypeSign(sign.type) +
												";color:" + assignColorTypeSign(sign.type, true));
				div.appendChild(signIdDiv);

				let widthDiv = Math.max((loc.width * this.scaleFactorImage + 2), signIdDiv.clientWidth);

				if ((loc.width * this.scaleFactorImage) < signIdDiv.clientWidth) {
					signIdDiv.style.left = (canvasDim.parentElement.offsetLeft +
											(loc.x * this.scaleFactorImage) -
											(widthDiv - (loc.width * this.scaleFactorImage)) / 2) + "px";
					signIdDiv.style.width = (widthDiv + 2) + "px";
				} else {
					signIdDiv.style.width = widthDiv + "px";
				}

				if (((sign.location.width * this.scaleFactorImage  > 60 && sign.location.height * this.scaleFactorImage > 30) ||
					(sign.location.width * this.scaleFactorImage > 30 && sign.location.height * this.scaleFactorImage > 60))) {

					let hoverZone = document.createElement("div");
					hoverZone.className = "hoverZone";
					hoverZone.setAttribute("style", "left:" + left + "px;" +
													"top:" + (canvasDim.offsetTop + (loc.y * this.scaleFactorImage)) + "px;" +
													"width: " + (loc.width * this.scaleFactorImage) + "px;" +
													"height: " + (loc.height * this.scaleFactorImage) + "px;" +
													"position:absolute;background-color:" + assignColorTypeSign(sign.type) +
													";opacity:0")

					let x = document.createElement("i");
					x.className = "bi bi-trash hoverZoneIcon";
					x.onclick = () => this.cleanSign(sign);

					let xWidth: number, xHeight: number, questionWidth: number, questionHeight: number;

					if (loc.width >= loc.height) {
						xWidth = loc.width * 3 * this.scaleFactorImage / 4 - 10;
						xHeight = questionHeight = (loc.height * this.scaleFactorImage) / 2 - 10;
						questionWidth = (loc.width * this.scaleFactorImage) / 4 - 10;
					} else {
						xWidth = questionWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
						xHeight = (loc.height * this.scaleFactorImage) / 4 - 10;
						questionHeight = (loc.height * 3 * this.scaleFactorImage) / 4 - 10;
					}

					x.setAttribute("style", "left:" + xWidth +  "px;top:" + xHeight + "px;width:1rem;height:1rem;" +
											"position:absolute;font-size:1rem;visibility:hidden;color:" +
											assignColorTypeSign(sign.type, true));

					hoverZone.append(x);

					let question = document.createElement("i");
					question.className = "bi bi-question-circle hoverZoneIcon";
					question.setAttribute("style", "left:" + questionWidth + "px;top:" + questionHeight + "px;" +
												   "position:absolute;width:1rem;height:1rem;font-size:1rem;color:" +
												   assignColorTypeSign(sign.type, true) + ";visibility:hidden");

					hoverZone.setAttribute("data-bs-toggle", "popover");
					hoverZone.setAttribute("data-bs-placement", "top");
					hoverZone.setAttribute("data-bs-title", sign.id);
					hoverZone.setAttribute("data-bs-content",
										  this.localizationService.translate("Area") + ": " +
										  this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.area()),
																	  '1.0-0',
																	  this.localizationService.getCurrentLocaleId()) +
										  "mm²<br>x: " +
										  this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.x),
																	  '1.0-0',
																	  this.localizationService.getCurrentLocaleId()) +
										  "mm<br>y: " +
										  this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.y),
																	  '1.0-0',
																	  this.localizationService.getCurrentLocaleId()) +
										  "mm<br>" + this.localizationService.translate("Width") + ": " +
										  this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.width),
																	  '1.0-0',
																	  this.localizationService.getCurrentLocaleId()) +
										  "mm<br>" + this.localizationService.translate("Height") + ": " +
										  this._decimalPipe.transform(this._pixelsToMms.transform(sign.location.height),
																	  '1.0-0',
																	  this.localizationService.getCurrentLocaleId()) +
										  "mm");

					hoverZone.append(question);

					div.appendChild(hoverZone);
				}
			}
		}
	}

	public assignColorTypeSign(signType: SIGNTYPE, colorSecondary: boolean = false): string {
		return assignColorTypeSign(signType, colorSecondary);
	}

	private checkPopovers(): void {
		let popovers = document.getElementsByClassName("popover");
		for (var i = popovers.length; i--; ){
			if (!this.signs.some(s => s.id == popovers[i].getElementsByClassName("popover-header")[0].textContent && s.render)) {
				popovers[i].remove();
			}
		}
	}

	public closePopover(signId: string): void {
		let popovers = document.getElementsByClassName("popover");
		for (var i = popovers.length; i--; ){
			if (!this.signs.some(s => s.id == signId)) {
				popovers[i].remove();
			}
		}
	}

	private closePopovers(): void {
		let popovers = document.getElementsByClassName("popover");
		for (var i = popovers.length; i--; ){
			popovers[i].remove();
		}
	}
}
