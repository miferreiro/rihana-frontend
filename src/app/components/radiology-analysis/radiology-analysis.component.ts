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

import {Component,EventEmitter,Input,OnInit,Output} from '@angular/core';
import {Radiograph} from '../../models/Radiograph';
import {Report} from '../../models/Report';

@Component({
	selector: 'app-radiology-analysis',
	templateUrl: './radiology-analysis.component.html',
	styleUrls: ['./radiology-analysis.component.css']
})
export class RadiologyAnalysisComponent implements OnInit {

	public typeExploration: string;
	public showImageDialog = false;

	public report: Report = new Report();

	@Input() set reportFields(report: Report) {
		this.report = report;
		if (this.report.hasOwnProperty("performedExplorations")) {
			let codes = this.report.performedExplorations.map(function(exploration) { return exploration.code;});
			if (codes.includes('70102')) {
				this.typeExploration = 'PA-LAT';
			} else {
				this.typeExploration = null;
			}
		} else {
			this.typeExploration = null;
		}
	};

	@Output() radiographs = new EventEmitter<Radiograph[]>();

	private _radiographs: Radiograph[] = [null, null];

	ngOnInit(): void {
		this.typeExploration = null;
	}

	public radiographHandler(event: Radiograph, type: string): void {
		if (event != undefined) {
			if (type != 'LAT') {
				this._radiographs[0] = event;
			} else {
				this._radiographs[1] = event;
			}
			this.radiographs.emit(this._radiographs);
		} else {
			if (type != 'LAT') {
				this._radiographs[0] = null;
			} else {
				this._radiographs[1] = null;
			}
			this.radiographs.emit(this._radiographs);
		}
	}
}
