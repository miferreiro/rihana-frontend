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

import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Radiograph} from '../../models/Radiograph';
import {Report} from '../../models/Report';

@Component({
	selector: 'app-exploration',
	templateUrl: './exploration.component.html',
	styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent {

	readonly return: string = '';

	public report: Report = new Report();

	public radiographs: Radiograph[] = [null, null, null];

	constructor(private router: Router) {
	}

	public reportHandler(report: Report): void {
		this.report = report;
	}

	public radiographsHandler(radiographs: Radiograph[]): void {
		this.radiographs = radiographs;
	}

	public saveExploration(): void {
		this.router.navigateByUrl(this.return);
	}

	public closeExploration(): void {
		this.router.navigateByUrl(this.return);
	}
}