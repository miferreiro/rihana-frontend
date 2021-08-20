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

import {DecimalPipe} from '@angular/common';
import {PixelsToMmsPipe} from '../../pipes/pixels-to-mms.pipe';
import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {assignColorTypeSign, Sign} from '../../models/Sign';
import {SignLocation} from '../../models/SignLocation';
import {LocalizationService} from '../../modules/internationalization/localization.service';

@Component({
	selector: 'app-image-annotator',
	templateUrl: './image-annotator.component.html',
	styleUrls: ['./image-annotator.component.css']
})
export class ImageAnnotatorComponent {

	private static readonly STROKE_SIZE = 2;

	@Input() disabled = false;

	@Output() newSign = new EventEmitter<Sign>();
	@Output() newSetScaleFactorImage = new EventEmitter<number>();
	@Output() removeSign = new EventEmitter<Sign>();

	@ViewChild('canvasElement') private canvasElementRef: ElementRef<HTMLCanvasElement>;
	@ViewChild('imageElement') private imageElementRef: ElementRef<HTMLImageElement>;

	private newSignLocation: SignLocation = null;
	private scaleFactorImage: number;

	private _src: string;
	private _signs: Sign[];
	private _brightness: string;
	private _contrast: string;

	constructor(private localizationService: LocalizationService,
				private _decimalPipe: DecimalPipe,
				private _pixelsToMms: PixelsToMmsPipe) { }

	get src(): string {
		return this._src;
	}

	@Input() set src(src: string) {
		this._src = src;
	}

	get brightness(): string {
		return this._brightness;
	}

	@Input() set brightness(brightness: string) {
		this._brightness = brightness;
		this.changeFilterImg();
	}

	get contrast(): string {
		return this._contrast;
	}

	@Input() set contrast(contrast: string) {
		this._contrast = contrast;
		this.changeFilterImg();
	}

	get signs(): Sign[] {
		return this._signs;
	}

	@Input() set signs(signs: Sign[]) {
		this._signs = signs;
		if (this.canvasElement !== null) {
			this.repaint();
		}
	}

	get context2D(): CanvasRenderingContext2D {
		return this.canvasElement.getContext('2d');
	}

	get canvasElement(): HTMLCanvasElement {
		return Boolean(this.canvasElementRef) ? this.canvasElementRef.nativeElement : null;
	}

	get imageElement(): HTMLImageElement {
		return this.imageElementRef.nativeElement;
	}

	get dataUrl(): string {
		return Boolean(this.canvasElement) ? this.canvasElement.toDataURL() : '#';
	}

	get isDrawing(): boolean {
		return this.newSignLocation !== null;
	}

	get signLocationToPaint(): SignLocation {
		return this.newSignLocation;
	}

	private canLocate(): boolean {
		return !this.disabled;
	}

	private repaint(): void {
		this.paintImage();
		this.paintSigns();
	}

	private paintImage(): void {
		const context = this.context2D;
		context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
		context.filter = 'brightness(' + Number(this._brightness) / 100 + ') contrast(' + Number(this._contrast) / 100 + ')';
		context.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height,
											 0, 0, this.canvasElement.width, this.canvasElement.height);
	}

	private paintSigns(): void {
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

		const context = this.context2D;
		context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;
		context.font = ".7rem Arial";

		for (let sign of this.signs) {
			if (sign.render) {
				let loc = sign.location;

				context.beginPath();
				context.strokeStyle = assignColorTypeSign(sign.type);;
				context.filter = 'brightness(1) contrast(1)';
				context.rect(loc.x * this.scaleFactorImage, loc.y * this.scaleFactorImage,
							 loc.width * this.scaleFactorImage, loc.height * this.scaleFactorImage);
				context.stroke();

				let canvasDim = document.querySelector("canvas");

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

				if (((sign.location.width * this.scaleFactorImage > 60 && sign.location.height * this.scaleFactorImage > 30) ||
					(sign.location.width * this.scaleFactorImage > 30 && sign.location.height * this.scaleFactorImage > 60))) {

					let hoverZone = document.createElement("div");
					hoverZone.className = "hoverZone";
					hoverZone.setAttribute("style", "left:" + left + "px;" +
													"top:" + (canvasDim.offsetTop + (loc.y * this.scaleFactorImage)) + "px;" +
													"width:" + (loc.width * this.scaleFactorImage) + "px;" +
													"height:" + (loc.height * this.scaleFactorImage) + "px;" +
													"position:absolute;background-color:" + assignColorTypeSign(sign.type) +
													";opacity:0")

					let question = document.createElement("i");
					question.className = "bi bi-question-circle hoverZoneIcon";

					let questionWidth: number, questionHeight: number;
					if (this.canLocate()) {

						let xWidth: number, xHeight: number;

						if (loc.width >= loc.height) {
							xWidth = loc.width * 3 * this.scaleFactorImage / 4 - 10;
							xHeight = questionHeight = (loc.height * this.scaleFactorImage) / 2 - 10;
							questionWidth = (loc.width * this.scaleFactorImage) / 4 - 10;
						} else {
							xWidth = questionWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
							xHeight = (loc.height * this.scaleFactorImage) / 4 - 10;
							questionHeight = (loc.height * 3 * this.scaleFactorImage) / 4 - 10;
						}

						let x = document.createElement("i");
						x.className = "bi bi-trash hoverZoneIcon";
						x.onclick = () => this.removeSign.emit(sign);

						x.setAttribute("style", "left:" + xWidth + "px;top:" + xHeight + "px;width:1rem;height:1rem;" +
												"position:absolute;font-size:1rem;visibility:hidden;color:" +
												assignColorTypeSign(sign.type, true));

						hoverZone.append(x);
					} else {
						questionWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
						questionHeight = (loc.height * this.scaleFactorImage) / 2 - 10;
					}

					question.setAttribute("style", "left:" + questionWidth + "px;top:" + questionHeight + "px;" +
											"position:absolute;width:1rem;height:1rem;font-size:1rem;color:" +
											assignColorTypeSign(sign.type, true) + ";visibility:hidden");

					question.setAttribute("data-bs-toggle", "popover");
					question.setAttribute("data-bs-placement", "top");
					question.setAttribute("data-bs-trigger", "focus");
					question.setAttribute("data-bs-title", sign.id);
					question.setAttribute("data-bs-content",
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

					question.addEventListener("inserted.bs.popover", function() {
						let popover = document.getElementById(question.getAttribute("aria-describedby"));
						if (popover) {
							let popoverHeader = popover.querySelectorAll("h3")[0] as HTMLElement;
							popoverHeader.style.backgroundColor = assignColorTypeSign(sign.type);
							popoverHeader.style.borderColor = assignColorTypeSign(sign.type);
							popoverHeader.style.color = assignColorTypeSign(sign.type, true);
						}
					});

					hoverZone.append(question);

					div.appendChild(hoverZone);
				} else if (sign.location.width * this.scaleFactorImage > 25 && sign.location.height * this.scaleFactorImage > 25) {
					let hoverZone = document.createElement("div");
					hoverZone.className = "hoverZone";
					hoverZone.setAttribute("style", "left:" + left + "px;" +
													"top:" + (canvasDim.offsetTop + (loc.y * this.scaleFactorImage)) + "px;" +
													"width:" + (loc.width * this.scaleFactorImage) + "px;" +
													"height:" + (loc.height * this.scaleFactorImage) + "px;" +
													"position:absolute;background-color:" + assignColorTypeSign(sign.type) +
													";opacity:0")

					let xWidth: number, xHeight: number;

					xWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
					xHeight = (loc.height * this.scaleFactorImage) / 2 - 10;

					let x = document.createElement("i");
					x.className = "bi bi-trash hoverZoneIcon";
					x.onclick = () => this.removeSign.emit(sign);

					x.setAttribute("style", "left:" + xWidth + "px;top:" + xHeight + "px;width:1rem;height:1rem;" +
											"position:absolute;font-size:1rem;visibility:hidden;color:" +
											assignColorTypeSign(sign.type, true));

					hoverZone.append(x);

					div.appendChild(hoverZone);
				}
			}
		}
	}

	private clearLocation(): void {
		let signLocation = this.signLocationToPaint;
		if (signLocation !== undefined && Boolean(signLocation) && signLocation.isValid()) {
		  try {
				const context = this.context2D;
				signLocation = signLocation.regularize();

				const x = Math.max(0, signLocation.x - ImageAnnotatorComponent.STROKE_SIZE);
				const y = Math.max(0, signLocation.y - ImageAnnotatorComponent.STROKE_SIZE);

				const width = Math.min(this.imageElement.width,
										signLocation.width + ImageAnnotatorComponent.STROKE_SIZE * 2);
				const height = Math.min(this.imageElement.height,
										signLocation.height + ImageAnnotatorComponent.STROKE_SIZE * 2);

				context.drawImage(this.imageElement, x, y, width, height, x, y, width, height);
			} catch (e) {
				// If context is not available an exception will be thrown.
		  	}
		}
	}

	private paintLocation(): void {
		const signLocation = this.signLocationToPaint;
		if (signLocation !== undefined && Boolean(signLocation) && signLocation.isValid()) {
			const context = this.context2D;

			context.beginPath();

			context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;
			context.strokeStyle = assignColorTypeSign(undefined);

			context.rect(signLocation.x * this.scaleFactorImage, signLocation.y * this.scaleFactorImage, signLocation.width * this.scaleFactorImage, signLocation.height * this.scaleFactorImage);
			context.stroke();
		}
	}

	private adjustMouseLocation(event: MouseEvent): {
		x: number, y: number
	} {
		const bounds = this.canvasElement.getBoundingClientRect();
		let x = Math.max(0, event.clientX - Math.round(bounds.left));
		let y = Math.max(0, event.clientY - Math.round(bounds.top));
		return {
			x: x,
			y: y
		};
	}

	onImageLoad() {
		this.resizeCanvas();
	}

	onMouseDown(event: MouseEvent) {
		if (this.canLocate()) {
			const location = this.adjustMouseLocation(event);
			this.clearLocation();
			this.newSignLocation = new SignLocation(location.x / this.scaleFactorImage, location.y / this.scaleFactorImage, 0, 0);
		}
	}

	onMouseMove(event: MouseEvent) {
		if (this.canLocate() && this.isDrawing) {
			const location = this.adjustMouseLocation(event);
			this.clearLocation();
			this.newSignLocation.width = (location.x / this.scaleFactorImage) - this.newSignLocation.x;
			this.newSignLocation.height = (location.y / this.scaleFactorImage) - this.newSignLocation.y;
			this.repaint();
			this.paintLocation();
		}
	}

	// Global listener is used to detect mouse up outside the canvas
	@HostListener('window:mouseup')
	onMouseUp() {
		if (this.canLocate() && this.isDrawing) {
			let sign = new Sign();
			sign.location = this.newSignLocation.regularize();
			sign.type = null;
			this.newSign.emit(sign);
			this.newSignLocation = null;
			this.repaint();
		}
	}

	@HostListener('window:resize', ['$event'])
	private resizeCanvas(): void {
		this.closePopovers();
		if (this.getMaxWidth() > this.getMaxHeight()) {
			this.scaleFactorImage = this.getMaxHeight() / this.imageElement.height;
			if (this.imageElement.width * this.scaleFactorImage > this.getMaxWidth()) {
				this.scaleFactorImage = this.getMaxWidth() / this.imageElement.width;
			}
		} else {
			this.scaleFactorImage = this.getMaxWidth() / this.imageElement.width;
			if (this.imageElement.height * this.scaleFactorImage > this.getMaxHeight()) {
				this.scaleFactorImage = this.getMaxHeight() / this.imageElement.height;
			}
		}

		this.canvasElement.width = this.imageElement.width * this.scaleFactorImage;
		this.canvasElement.height = this.imageElement.height * this.scaleFactorImage;

		let imgControls = document.querySelectorAll("#image-dialog .img-controls");
		for (let i = imgControls.length; i--; ) {
			let slide = imgControls[i] as HTMLElement;
			slide.style.maxWidth = this.canvasElement.width.toString() + 'px';
		}
		let controls = document.querySelectorAll("#image-dialog .options");
		for (let i = controls.length; i--; ) {
			let slide = controls[i] as HTMLElement;
			slide.style.maxWidth = this.canvasElement.width.toString() + 'px';
		}
		this.repaint();
		this.newSetScaleFactorImage.emit(this.scaleFactorImage);
	}

	private getMaxWidth(): number {
		let widthRadiographySection = parseInt(getComputedStyle(document.getElementById("section-radiography")).width) -
									  parseInt(getComputedStyle(document.getElementById("section-radiography")).paddingLeft) -
		 							  parseInt(getComputedStyle(document.getElementById("section-radiography")).paddingRight);

		return widthRadiographySection;
	}

	private getMaxHeight(): number {
		let heightHeader = 	parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).height) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).marginTop) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).marginBottom) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).paddingTop) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).paddingBottom);

		let heightImgControls = 0;
		[].forEach.call(document.getElementById("image-dialog").getElementsByClassName("img-controls"), function(item) {
			heightImgControls+= parseInt(getComputedStyle(item).height) +
							parseInt(getComputedStyle(item).marginTop) +
							parseInt(getComputedStyle(item).marginBottom) +
							parseInt(getComputedStyle(item).paddingTop) +
							parseInt(getComputedStyle(item).paddingBottom);
		});

		let heightOptions = parseInt(getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("options")[0]).height) +
							parseInt(getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("options")[0]).marginTop) +
							parseInt(getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("options")[0]).marginBottom) +
							parseInt(getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("options")[0]).paddingTop) +
							parseInt(getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("options")[0]).paddingBottom);

		let heightFooter = 	parseInt(getComputedStyle(document.getElementsByClassName("modal-footer-custom")[0]).height) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-footer-custom")[0]).marginTop) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-footer-custom")[0]).marginBottom) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-footer-custom")[0]).paddingTop) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-footer-custom")[0]).paddingBottom);

		var heightMax = parseInt(getComputedStyle(document.getElementById("modal")).height) - heightImgControls - heightHeader - heightFooter - heightOptions;

		return heightMax;
	}

	private changeFilterImg(): void {
		if (this.canvasElement) {
			this.repaint();
		}
	}

	private checkPopovers(): void {
		let popovers = document.getElementsByClassName("popover");
		for (var i = popovers.length; i--; ){
			if (!this.signs.some(s => s.id == popovers[i].getElementsByClassName("popover-header")[0].textContent && s.render)) {
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
