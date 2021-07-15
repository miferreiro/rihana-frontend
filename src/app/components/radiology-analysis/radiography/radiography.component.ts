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

import {Component, Input, OnInit} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {BehaviorSubject, Subscription} from 'rxjs';

@Component({
  selector: 'app-radiography',
  templateUrl: './radiography.component.html',
  styleUrls: ['./radiography.component.css']
})
export class RadiographyComponent implements OnInit {

	@Input() typeExploration: string;

	private subscription: Subscription;

	public readonly controlRadiography = new FileUploadControl(
		{listVisible: true, accept: ['image/png'], discardInvalid: true, multiple: false},
		[FileUploadValidators.accept(['image/png']), FileUploadValidators.filesLimit(1)]
	);

	public uploadedFile: BehaviorSubject<string> = new BehaviorSubject(null);

	public brightness: string;
	public contrast: string;
	public zoom: string;

	public isLoadingRadiography = false;

	ngOnInit(): void {
		this.isLoadingRadiography = true;
		this.subscription = this.controlRadiography.valueChanges.subscribe((values: Array<File>) => {
			this.uploadedFile = this.loadRadiography(values[0]);
			this.uploadedFile.subscribe(event => {
				this.isLoadingRadiography = (event == null);
			});
		});
		this.brightness = '100';
		this.contrast = '100';
		this.zoom = '0';
	}

	public addRadiography(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}
		const file = input.files[0];
		this.controlRadiography.setValue([]);
		this.controlRadiography.addFile(file);
	}

	private loadRadiography(file: File): BehaviorSubject<string> {
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
		this.brightness = input.value;

		let img = document.getElementById('img-radiography');
		img.setAttribute('style', 'filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(this.brightness) /  100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(this.zoom) + 100) / 100) + ');');
	}

	public changeContrast(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.contrast = input.value;

		let img = document.getElementById('img-radiography');
		img.setAttribute('style', 'filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(this.brightness) /  100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(this.zoom) + 100) / 100) + ');');
	}

	public changeZoom(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.zoom = input.value;

		let img = document.getElementById('img-radiography');
		img.setAttribute('style', 'filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(this.brightness) /  100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(this.zoom) + 100) / 100) + ');');
	}

	public resetRadiography(): void {
		this.brightness = '100';
		this.contrast = '100';
		this.zoom = '0';

		let img = document.getElementById('img-radiography');
		img.setAttribute('style', 'filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-webkit-filter:brightness(' + Number(this.brightness) / 100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  '-moz-filter:brightness(' + Number(this.brightness) /  100 + ') ' +
								  'contrast(' + Number(this.contrast) / 100 + ');' +
						 		  'transform:scale(' + ((Number(this.zoom) + 100) / 100) + ');');
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
