/*
 * RIHANA Frontend
 *
 * Copyright (C) 2021-2022 David A. Ruano Ordás, José Ramón Méndez Reboredo,
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

	@Input() exploration: Exploration;
	@Input() isEditing: boolean;

	@Output() radiographs = new EventEmitter<Radiograph[]>();
	@Output() explorationType = new EventEmitter<string>();


	public _explorationType: string;
	public showImageDialog = false;
	public report: Report = new Report();

	private _radiographs: Radiograph[];

	ngOnInit(): void {
		if (this.exploration.title != undefined) {
			this._radiographs = this.exploration.radiographs;
			if (this._radiographs.length == 2) {
				this._explorationType = 'PA-LAT';
			} else {
				this._explorationType = 'AP';
			}
		} else {
			this._explorationType = 'PA-LAT';
			this._radiographs = [];
		}
		this.explorationType.emit(this._explorationType);
	}

	public radiographHandler(event: Radiograph, type: string): void {
		if (event == undefined) {
			event = null;
		}

		if (type == 'PA') {
			this._radiographs[0] = event;
		} else if (type == 'AP') {
			this._radiographs = [event];
		} else {
			this._radiographs[1] = event;
		}

		this.radiographs.emit(this._radiographs);
	}

	public getExplorationType(): string {
		return this._explorationType;
	}

	public setExplorationType(type: string): void {
		this._explorationType = type;
		this.explorationType.emit(this._explorationType);
	}

	public showRadiograph(type: string): boolean {
		return type === this._explorationType;
	}

	public getRadiographType(type: string): Radiograph {
		return this._radiographs.find(radiograph => radiograph.type == type)
	}
}