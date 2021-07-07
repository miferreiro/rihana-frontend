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

import {Component,Input,OnDestroy,OnInit} from '@angular/core';
import {FileUploadControl,FileUploadValidators} from '@iplab/ngx-file-upload';
import {BehaviorSubject,Subscription} from 'rxjs';

@Component({
	selector: 'app-radiology-analysis',
	templateUrl: './radiology-analysis.component.html',
	styleUrls: ['./radiology-analysis.component.css']
})
export class RadiologyAnalysisComponent implements OnInit, OnDestroy {

	public typeExploration: string;

	private subscriptionRadiologyMain: Subscription;

	public readonly controlRadiologyMain = new FileUploadControl(
		{listVisible: true, accept: ['image/png'], discardInvalid: true, multiple: false},
		[FileUploadValidators.accept(['image/png']), FileUploadValidators.filesLimit(1)]
	);

	public uploadedFileMain: BehaviorSubject<string> = new BehaviorSubject(null);

	public brightnessMain: string;
	public contrastMain: string;
	public zoomMain: string;

	private subscriptionRadiologyLAT: Subscription;

	public readonly controlRadiologyLAT = new FileUploadControl(
		{listVisible: true, accept: ['image/png'], discardInvalid: true, multiple: false},
		[FileUploadValidators.accept(['image/png']), FileUploadValidators.filesLimit(1)]
	);

	public uploadedFileLAT: BehaviorSubject<string> = new BehaviorSubject(null);

	public brightnessLAT: string;
	public contrastLAT: string;
	public zoomLAT: string;

	public report: { [key: string]: any } = {};

	@Input() set reportFields(report: { [key: string]: any }) {
		this.report = report;
		if (this.report.hasOwnProperty("performedExplorations")) {
			let codes = this.report.performedExplorations.map(function(a) { return a.code;});
			if (codes.includes('70102')) {
				this.typeExploration = 'PA-LAT';
			} else {
				this.typeExploration = 'PP';
			}
		} else {
			this.typeExploration = 'PA-LAT';
		}
	};

	isLoadingInitialDataMain = false;
	isLoadingInitialDataLAT = false;

	constructor() { }

	ngOnInit(): void {
		this.typeExploration = 'PA-LAT';
		this.isLoadingInitialDataMain = true;
		this.isLoadingInitialDataLAT = true;

		this.subscriptionRadiologyMain = this.controlRadiologyMain.valueChanges.subscribe((values: Array<File>) =>{
			this.uploadedFileMain = this.loadRadiology(values[0]);
			this.uploadedFileMain.subscribe(event => {
				this.isLoadingInitialDataMain = (event == null);
			});
		});
		this.brightnessMain = '100';
		this.contrastMain = '100';
		this.zoomMain = '0';

		this.subscriptionRadiologyLAT = this.controlRadiologyLAT.valueChanges.subscribe((values: Array<File>) =>{
			this.uploadedFileLAT = this.loadRadiology(values[0]);
			this.uploadedFileLAT.subscribe(event => {
				this.isLoadingInitialDataLAT = (event == null);
			});
		});
		this.brightnessLAT = '100';
		this.contrastLAT = '100';
		this.zoomLAT = '0';
	}

	public addRadiology(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}
		const file = input.files[0];
		if (input.name == "inputRadiologyMain") {
			this.controlRadiologyMain.setValue([]);
			this.controlRadiologyMain.addFile(file);
		} else {
			this.controlRadiologyLAT.setValue([]);
			this.controlRadiologyLAT.addFile(file)
		}
	}

	private loadRadiology(file: File): BehaviorSubject<string> {
		let uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);
		if (file != undefined) {
			const fr = new FileReader();
			fr.onload = async (e) => uploadedFile.next(e.target.result.toString());
			fr.readAsDataURL(file);
		} else {
			uploadedFile.next(null);
		}
		return uploadedFile;
	}

	public changeBrightness(event: Event): void {
		const input = event.target as HTMLInputElement;

		let img: HTMLElement;
		let brightness: string;
		let contrast: string;
		let zoom: string;

		if (input.name == "radiologyMain") {
			this.brightnessMain = input.value;
			img = document.getElementById('img-radiologyMain');
			brightness = this.brightnessMain;
			contrast = this.contrastMain;
			zoom = this.zoomMain;
		} else {
			this.brightnessLAT = input.value;
			img = document.getElementById('img-radiologyLAT');
			brightness = this.brightnessLAT;
			contrast = this.contrastLAT;
			zoom = this.zoomLAT;
		}
		img.setAttribute('style', 'filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(brightness) /  100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(zoom) + 100) / 100) + ');');
	}

	public changeContrast(event: Event): void {
		const input = event.target as HTMLInputElement;

		let img: HTMLElement;
		let brightness: string;
		let contrast: string;
		let zoom: string;

		if (input.name == "radiologyMain") {
			this.contrastMain = input.value;
			img = document.getElementById('img-radiologyMain');
			brightness = this.brightnessMain;
			contrast = this.contrastMain;
			zoom = this.zoomMain;
		} else {
			this.contrastLAT = input.value;
			img = document.getElementById('img-radiologyLAT');
			brightness = this.brightnessLAT;
			contrast = this.contrastLAT;
			zoom = this.zoomLAT;
		}
		img.setAttribute('style', 'filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(brightness) /  100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(zoom) + 100) / 100) + ');');
	}

	public changeZoom(event: Event): void {
		const input = event.target as HTMLInputElement;

		let img: HTMLElement;
		let brightness: string;
		let contrast: string;
		let zoom: string;

		if (input.name == "radiologyMain") {
			this.zoomMain = input.value;
			img = document.getElementById('img-radiologyMain');
			brightness = this.brightnessMain;
			contrast = this.contrastMain;
			zoom = this.zoomMain;
		} else {
			this.zoomLAT = input.value;
			img = document.getElementById('img-radiologyLAT');
			brightness = this.brightnessLAT;
			contrast = this.contrastLAT;
			zoom = this.zoomLAT;
		}
		img.setAttribute('style', 'filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(brightness) /  100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(zoom) + 100) / 100) + ');');
	}

	public resetRadiology(event: Event): void {
		const i = event.target as HTMLInputElement;
		let img: HTMLElement;
		let brightness: string;
		let contrast: string;
		let zoom: string;

		if (i.getAttribute("name")== "radiologyMain") {
			this.brightnessMain = '100';
			this.contrastMain = '100';
			this.zoomMain = '0';
			img = document.getElementById('img-radiologyMain');
			brightness = this.brightnessMain;
			contrast = this.contrastMain;
			zoom = this.zoomMain;
		} else {
			this.brightnessLAT = '100';
			this.contrastLAT = '100';
			this.zoomLAT = '0';
			img = document.getElementById('img-radiologyLAT');
			brightness = this.brightnessLAT;
			contrast = this.contrastLAT;
			zoom = this.zoomLAT;
		}
		img.setAttribute('style', 'filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(brightness) / 100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(brightness) /  100 + ') ' +
								  'contrast(' + Number(contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(zoom) + 100) / 100) + ');');
	}

	public ngOnDestroy(): void {
		this.subscriptionRadiologyMain.unsubscribe();
		this.subscriptionRadiologyLAT.unsubscribe();
	}
}
