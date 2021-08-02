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

import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {assignColorTypeSign, Sign} from '../../models/Sign';
import {SignLocation} from '../../models/SignLocation';

@Component({
	selector: 'app-image-annotator',
	templateUrl: './image-annotator.component.html',
	styleUrls: ['./image-annotator.component.css']
})
export class ImageAnnotatorComponent implements OnInit {

	private static readonly STROKE_SIZE = 2;

	@Output() newSign = new EventEmitter<Sign>();
	@Output() newSetScaleFactorImage = new EventEmitter<number>();

	@ViewChild('canvasElement') private canvasElementRef: ElementRef<HTMLCanvasElement>;
	@ViewChild('imageElement') private imageElementRef: ElementRef<HTMLImageElement>;

	private newSignLocation: SignLocation = null;
	private scaleFactorImage: number;
	public isLoadingImage: boolean = false;

	private _src: string;
	private _signs: Sign[];
	private _brightness: string;
	private _contrast: string;
	private _zoom: string;

	ngOnInit(): void {
		this.isLoadingImage = true;
		this.scaleFactorImage = 1;
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
		this.changeFilterImg();
	}

	get contrast(): string {
		return this._contrast;
	}

	@Input() set contrast(contrast: string) {
		this._contrast = contrast;
		this.changeFilterImg();
	}

	get zoom(): string {
		return this._zoom;
	}

	@Input() set zoom(zoom: string) {
		this._zoom = zoom;
		this.changeFilterImg();
	}

	get signs(): Sign[] {
		return this._signs;
	}

	@Input() set signs(signs: Sign[]) {
		this._signs = signs;
		if (this.canvasElement !== null) {
			if (this._signs.length > 0) {
				this.repaint();
			} else {
				this.paintImage();
			}
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
		const context = this.context2D;

		context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;
		context.font = ".7rem Arial";

		for (let sign of this.signs) {
			let location: SignLocation = sign.location.regularize();
			if (Boolean(location) && location.isValid() && sign.render) {
				context.beginPath();

				context.strokeStyle = assignColorTypeSign(sign.type);;
				context.filter = 'brightness(1) contrast(1)';
				context.rect(location.x * this.scaleFactorImage, location.y * this.scaleFactorImage,
							 location.width * this.scaleFactorImage, location.height * this.scaleFactorImage);

				context.fillStyle = assignColorTypeSign(sign.type);
				context.fillText(sign.id, location.x * this.scaleFactorImage,
										  ((location.y + location.height) * this.scaleFactorImage) + 15,
										  location.width * this.scaleFactorImage);

				context.stroke();
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
		let x = event.clientX - Math.round(bounds.left);
		let y = event.clientY - Math.round(bounds.top);
		if (x < 0) {
			x = 0;
		}
		if (y < 0) {
			y = 0;
		}
		return {
			x: x,
			y: y
		};
	}

	onImageLoad() {
		this.resizeCanvas();
		this.repaint();
		this.isLoadingImage = false;
	}

	onMouseDown(event: MouseEvent) {
		const location = this.adjustMouseLocation(event);
		this.clearLocation();
		this.newSignLocation = new SignLocation(location.x / this.scaleFactorImage, location.y / this.scaleFactorImage, 0, 0);
	}

	onMouseMove(event: MouseEvent) {
		if (this.isDrawing) {
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
		if (this.isDrawing) {
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

		if(this.imageElement.height > this.getMaxHeight())
			this.scaleFactorImage = this.getMaxHeight() / this.imageElement.height;
		else if(this.imageElement.width > this.getMaxWidth())
			this.scaleFactorImage = this.getMaxWidth() / this.imageElement.width;

		this.canvasElement.width = this.imageElement.width * this.scaleFactorImage;
		this.canvasElement.height = this.imageElement.height * this.scaleFactorImage;

		this.newSetScaleFactorImage.emit(this.scaleFactorImage);
		this.repaint();
	}

	private getMaxWidth(): number {
		let widthHeader = 	parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).width) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).marginLeft) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).marginRight) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).paddingLeft) +
							parseInt(getComputedStyle(document.getElementsByClassName("modal-header-custom")[0]).paddingRight);

		return widthHeader;
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
		if (this.canvasElement){
			this.canvasElement.setAttribute("style", "transform:scale(" + ((Number(this.zoom) + 100) / 100) + ")");
			this.repaint();
		}
	}
}
