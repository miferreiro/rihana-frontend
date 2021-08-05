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


import {SignLocation} from "./SignLocation";

export class Sign {
	id: string;
	location: SignLocation;
	type: SIGNTYPE;
	render: boolean;
	brightness: number;
	contrast: number;
}

export enum SIGNTYPE {
	NO_FINDING = 'No finding',
	CARDIOMEGALY = 'Cardiomegaly',
	CONDENSATION = 'Condensation',
	MASSES = 'Masses',
	NODULES = 'Nodules',
	PLEURAL_EFFUSION = 'Pleural effusion',
	PNEUMOTHORAX = 'Pneumothorax',
	REDISTRIBUTION = 'Redistribution'
}

export function assignColorTypeSign(signType: SIGNTYPE, colorSecondary: boolean = false): string {
	let color: string;
	switch (signType) {
		case SIGNTYPE.CARDIOMEGALY:
			// Color family: red
			if (!colorSecondary) {
				color = '#E6B8B8';

			} else {
				color = '#990F0B';
			}
			break;
		case SIGNTYPE.CONDENSATION:
			// Color family: lightgreen
			if (!colorSecondary) {
				color = '#A4FFAF';
			} else {
				color = '#0E5102';
			}
			break;
		case SIGNTYPE.MASSES:
			// Color family: lightblue
			if (!colorSecondary) {
				color = '#B5FCFF';
			} else {
				color = '#024045';
			}
			break;
		case SIGNTYPE.NODULES:
			// Color family: darkblue
			if (!colorSecondary) {
				color = '#70ACFF';
			} else {
				color = '#091365';
			}
			break;
		case SIGNTYPE.PLEURAL_EFFUSION:
			// Color family: purple
			if (!colorSecondary) {
				color = '#F6A9FF';
			} else {
				color = '#5609A9';
			}
			break;
		case SIGNTYPE.PNEUMOTHORAX:
			// Color family: brown
			if (!colorSecondary) {
				color = '#a1887f';
			} else {
				color = '#4e342e';
			}
			break;
		case SIGNTYPE.REDISTRIBUTION:
			// Color family: orange
			if (!colorSecondary) {
				color = '#FFC37D';
			} else {
				color = '#843E04';
			}
			break;
		default:
			color = 'yellow';
			break;
	}
	return color;
}