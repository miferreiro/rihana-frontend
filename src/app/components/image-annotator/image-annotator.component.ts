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

import {ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Sign} from '../../models/Sign';
import {SignLocation} from '../../models/SignLocation';
import {PanZoomConfig, PanZoomAPI, PanZoomModel, PanZoomConfigOptions} from 'ngx-panzoom';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-image-annotator',
	templateUrl: './image-annotator.component.html',
	styleUrls: ['./image-annotator.component.css']
})
export class ImageAnnotatorComponent implements OnInit, OnDestroy {

	private static readonly STROKE_SIZE = 2;

	@Input() disabled: boolean;

	@Output() newSign = new EventEmitter<Sign>();
	@Output() newSetScaleFactorImage = new EventEmitter<number>();
	@Output() removeSign = new EventEmitter<Sign>();

	@Output() brightnessChange = new EventEmitter<string>();
	@Output() contrastChange = new EventEmitter<string>();

	@ViewChild('canvasElement') private canvasElementRef: ElementRef<HTMLCanvasElement>;
	@ViewChild('imageElement') private imageElementRef: ElementRef<HTMLImageElement>;

	private defaultColor: string = "yellow";
	private newSignLocation: SignLocation = null;
	private scaleFactorImage: number;

	private _src: string;
	private _signs: Sign[];
	private _brightness: string;
	private _contrast: string;
	private zoom: number;

	private panZoomConfigOptions: PanZoomConfigOptions = {
		zoomLevels: 5,
		scalePerZoomLevel: 2.0,
		zoomStepDuration: 0.2,
		neutralZoomLevel: 0,
		freeMouseWheelFactor: 0.01,
		zoomToFitZoomLevelFactor: 0.95,
		dragMouseButton: 'middle',
		keepInBounds: true,
		dynamicContentDimensions: true
	};

	public panzoomConfig: PanZoomConfig = new PanZoomConfig(this.panZoomConfigOptions);
	private panZoomAPI: PanZoomAPI;
	private apiSubscription: Subscription;
	private panzoomModel: PanZoomModel;
	private modelChangedSubscription: Subscription;

	constructor(private changeDetector: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.panzoomConfig.neutralZoomLevel = 2;
		this.apiSubscription = this.panzoomConfig.api.subscribe( (api: PanZoomAPI) => this.panZoomAPI = api );
    	this.modelChangedSubscription = this.panzoomConfig.modelChanged.subscribe(
			 (model: PanZoomModel) => this.onModelChanged(model)
			);
	}

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
		this.brightnessChange.emit(this._brightness);
		this.changeFilterImg();
	}

	get contrast(): string {
		return this._contrast;
	}

	@Input() set contrast(contrast: string) {
		this._contrast = contrast;
		this.contrastChange.emit(this._contrast);
		this.changeFilterImg();
	}

	get signs(): Sign[] {
		return this._signs;
	}

	@Input() set signs(signs: Sign[]) {
		this._signs = signs;
		if (this.canvasElement !== null) {
			this.repaint(true);
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

	public resetPanZoom() {
		if (this.panZoomAPI != undefined) {
			this.panZoomAPI.resetView();
		}
		this.zoom = 2;
	}

	private repaint(paintSignsInfo: boolean = false): void {
		this.paintImage();
		this.paintSignsCanvas();
		if (paintSignsInfo) {
			this.paintSignsInfo();
		}
	}

	private paintImage(): void {
		const context = this.context2D;
		context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
		context.filter = 'brightness(' + Number(this._brightness) / 100 + ') contrast(' + Number(this._contrast) / 100 + ')';
		context.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height,
											 0, 0, this.canvasElement.width, this.canvasElement.height);
	}

	private paintSignsCanvas(): void {
		const context = this.context2D;
		context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;

		for (let sign of this.signs) {
			if (sign.render) {
				let loc = sign.location;

				context.beginPath();
				context.strokeStyle = sign.type.primaryColor;
				context.filter = 'brightness(1) contrast(1)';
				context.rect(loc.x * this.scaleFactorImage, loc.y * this.scaleFactorImage,
							 loc.width * this.scaleFactorImage, loc.height * this.scaleFactorImage);
				context.stroke();
			}
		}
	}

	private paintSignsInfo(): void {
		let div = document.getElementById("canvasZone");
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
				let loc = sign.location;
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
												"background-color:" + sign.type.primaryColor +
												";color:" + sign.type.secondaryColor);
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
													"position:absolute;background-color:" + sign.type.primaryColor +
													";opacity:0")

					if (this.canLocate()) {
						let xWidth: number, xHeight: number;

						if (loc.width >= loc.height) {
							xWidth = loc.width * this.scaleFactorImage / 2 - 10;
							xHeight = (loc.height * this.scaleFactorImage) / 2 - 10;
						} else {
							xWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
							xHeight = (loc.height * this.scaleFactorImage) / 2 - 10;
						}

						let x = document.createElement("i");
						x.className = "bi bi-trash hoverZoneIcon";
						x.onclick = () => this.removeSign.emit(sign);

						x.setAttribute("style", "left:" + xWidth + "px;top:" + xHeight + "px;width:1rem;height:1rem;" +
												"position:absolute;font-size:1rem;visibility:hidden;color:" +
												sign.type.secondaryColor);

						hoverZone.append(x);
						div.appendChild(hoverZone);
					}
				} else if (sign.location.width * this.scaleFactorImage > 25 && sign.location.height * this.scaleFactorImage > 25) {
					let hoverZone = document.createElement("div");
					hoverZone.className = "hoverZone";
					hoverZone.setAttribute("style", "left:" + left + "px;" +
													"top:" + (canvasDim.offsetTop + (loc.y * this.scaleFactorImage)) + "px;" +
													"width:" + (loc.width * this.scaleFactorImage) + "px;" +
													"height:" + (loc.height * this.scaleFactorImage) + "px;" +
													"position:absolute;background-color:" + sign.type.primaryColor +
													";opacity:0")


					if (this.canLocate()) {
						let xWidth: number, xHeight: number;

						xWidth = (loc.width * this.scaleFactorImage) / 2 - 10;
						xHeight = (loc.height * this.scaleFactorImage) / 2 - 10;

						let x = document.createElement("i");
						x.className = "bi bi-trash hoverZoneIcon";
						x.onclick = () => this.removeSign.emit(sign);

						x.setAttribute("style", "left:" + xWidth + "px;top:" + xHeight + "px;width:1rem;height:1rem;" +
												"position:absolute;font-size:1rem;visibility:hidden;color:" +
												sign.type.secondaryColor);

						hoverZone.append(x);
						div.appendChild(hoverZone);
					}
				}
			}
		}
	}

	private paintLocation(): void {
		const signLocation = this.signLocationToPaint;
		if (signLocation !== undefined && Boolean(signLocation) && signLocation.isValid()) {
			const context = this.context2D;

			context.beginPath();

			context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;
			context.strokeStyle = this.defaultColor;

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

	onRightClick() {
		return false;
	}

	onMouseDown(event: MouseEvent) {
		if (event.which == 1) {
			this.canvasElement.className = "cursor";
			if (this.canLocate()) {
				const location = this.adjustMouseLocation(event);

				location.x = location.x / this.getCssScale(this.zoom);
				location.y = location.y / this.getCssScale(this.zoom);

				this.newSignLocation = new SignLocation(location.x / this.scaleFactorImage, location.y / this.scaleFactorImage, 0, 0);
			}
		} else if (event.which === 2) {
			const location = this.adjustMouseLocation(event);
			this.canvasElement.className = "cursorGrabbing";
		} else if (event.which == 3) {
			const location = this.adjustMouseLocation(event);
			this.canvasElement.className = "cursorBC";
			this.brightness = (Math.round((location.y / this.canvasElement.height) * 200)).toString();
			this.contrast = (Math.round((location.x / this.canvasElement.width) * 200)).toString();
		}
	}

	onModelChanged(model: PanZoomModel): void {
		this.changeDetector.markForCheck();
		this.changeDetector.detectChanges();

		if (!(model.pan == null || model.zoomLevel == null)) {
			this.zoom = model.zoomLevel;
		}
		this.repaint(false);
	}

	onMouseMove(event: MouseEvent) {
		if (event.which == 1) {
			if (this.canLocate() && this.isDrawing) {
				const location = this.adjustMouseLocation(event);

				location.x = location.x / this.getCssScale(this.zoom);
				location.y = location.y / this.getCssScale(this.zoom);

				this.newSignLocation.width = (location.x / this.scaleFactorImage) - this.newSignLocation.x;
				this.newSignLocation.height = (location.y / this.scaleFactorImage) - this.newSignLocation.y;
				this.repaint(false);
				this.paintLocation();
			}
		} else if (event.which == 3) {
			const location = this.adjustMouseLocation(event);
			this.brightness = (Math.round((location.y / this.canvasElement.height) * 200)).toString();
			this.contrast = (Math.round((location.x / this.canvasElement.width) * 200)).toString();
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
			this.repaint(false);
		}
		this.canvasElement.className = "cursor";
	}

	@HostListener('window:resize', ['$event'])
	private resizeCanvas(): void {
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

		let controls = document.querySelectorAll("#image-dialog .control-options");
		for (let i = controls.length; i--; ) {
			let slide = controls[i] as HTMLElement;
			slide.style.maxWidth = this.canvasElement.width.toString() + 'px';
		}

		let div = document.querySelector(".image-annotator-div-parent") as HTMLElement;
		div.style.width = this.canvasElement.width.toString() + 'px';
		div.style.height = this.canvasElement.height.toString() + 'px';

		this.repaint(true);
		this.newSetScaleFactorImage.emit(this.scaleFactorImage);
	}

	private getMaxWidth(): number {
		let styleSection = getComputedStyle(document.getElementById("section-radiograph"));
		let widthRadiographySection = parseInt(styleSection.width) -
									  parseInt(styleSection.paddingLeft) -
		 							  parseInt(styleSection.paddingRight);

		return widthRadiographySection;
	}

	private getMaxHeight(): number {
		let styleModalHeader = getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]);
		let heightHeader = 	parseInt(styleModalHeader.height) +
							parseInt(styleModalHeader.marginTop) +
							parseInt(styleModalHeader.marginBottom) +
							parseInt(styleModalHeader.paddingTop) +
							parseInt(styleModalHeader.paddingBottom);

		let styleImageDialog = getComputedStyle(document.getElementById("image-dialog").getElementsByClassName("control-options")[0]);

		let heightOptions = parseInt(styleImageDialog.height) +
							parseInt(styleImageDialog.marginTop) +
							parseInt(styleImageDialog.marginBottom) +
							parseInt(styleImageDialog.paddingTop) +
							parseInt(styleImageDialog.paddingBottom);

		var heightMax = parseInt(getComputedStyle(document.getElementById("modal")).height) - heightHeader - heightOptions;

		return heightMax;
	}

	private changeFilterImg(): void {
		if (this.canvasElement) {
			this.repaint(true);
		}
	}

	private getCssScale(zoomLevel: any): number {
		return Math.pow(this.panzoomConfig.scalePerZoomLevel, zoomLevel - this.panzoomConfig.neutralZoomLevel);
	}

	public disableScroll(disable: boolean) {
		if (disable) {
			document.getElementById("image-dialog").style.overflowX = "unset";
			document.getElementById("image-dialog").style.overflowY = "unset";
		} else {
			document.getElementById("image-dialog").style.overflowX = "hidden";
			document.getElementById("image-dialog").style.overflowY = "auto";
		}
	}

	ngOnDestroy(): void {
		this.apiSubscription.unsubscribe();
	}
}