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
import {Exploration} from '../../models/Exploration';
import {Radiograph} from '../../models/Radiograph';
import {Report} from '../../models/Report';

@Component({
	selector: 'app-radiology-analysis',
	templateUrl: './radiology-analysis.component.html',
	styleUrls: ['./radiology-analysis.component.css']
})
export class RadiologyAnalysisComponent implements OnInit {

	public _typeExploration: string;
	public showImageDialog = false;

	@Input() exploration: Exploration;
	public report: Report = new Report();

	@Output() radiographs = new EventEmitter<Radiograph[]>();
	@Output() typeExploration = new EventEmitter<string>();

	private _radiographs: Radiograph[];

	ngOnInit(): void {

		if (this.exploration.title != undefined) {
			this._radiographs = this.exploration.radiographs;
			if (this._radiographs.length == 2) {
				this._typeExploration = 'PA-LAT';
				this.typeExploration.emit(this._typeExploration);
			} else {
				this._typeExploration = 'AP';
				this.typeExploration.emit(this._typeExploration);
			}
		} else {
			this._typeExploration = 'PA-LAT';
			this.typeExploration.emit(this._typeExploration);
			this._radiographs = [];
		}
	}

	@Input() set reportFields(report: Report) {
		this.report = report;
		if (this.report.hasOwnProperty("performedExplorations")) {
			let codes: string[] = this.report.performedExplorations.map(function(exploration) { return exploration.code; });
			if (codes.includes('70102')) {
				this._typeExploration = 'PA-LAT';
			} else if (codes.includes('70101') || codes.includes('70121')) {
				this._typeExploration = 'AP';
			} else {
				this._typeExploration = 'PA-LAT';
			}
		} else {
			this._typeExploration = 'PA-LAT';
		}
		this.typeExploration.emit(this._typeExploration);
	};

	public radiographHandler(event: Radiograph, type: string): void {

		if (event == undefined) {
			event = null;
		}

		if (type == 'PA' || type == 'AP') {
			this._radiographs[0] = event;
		} else {
			this._radiographs[1] = event;
		}

		this.radiographs.emit(this._radiographs);
	}

	public showRadiograph(type: string): boolean {
		return type === this._typeExploration;
	}
}
