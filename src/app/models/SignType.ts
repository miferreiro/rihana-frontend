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

export class SignType {
	code: string;
	name: string;
	description: string;
	target: number;
}

export function assignColorTypeSign(signType: SignType, colorSecondary: boolean = false): string {
	let color: string;
	let defaultColor: string = 'yellow';

	if (signType == undefined) {
		return defaultColor;
	} else {
		switch (signType.code) {
			case 'CAR':
				// Color family: red
				if (!colorSecondary) {
					color = '#E6B8B8';
				} else {
					color = '#990F0B';
				}
				break;
			case 'CON':
				// Color family: lightgreen
				if (!colorSecondary) {
					color = '#A4FFAF';
				} else {
					color = '#0E5102';
				}
				break;
			case 'MAS':
				// Color family: lightblue
				if (!colorSecondary) {
					color = '#B5FCFF';
				} else {
					color = '#024045';
				}
				break;
			case 'NOD':
				// Color family: darkblue
				if (!colorSecondary) {
					color = '#70ACFF';
				} else {
					color = '#091365';
				}
				break;
			case 'PLE':
				// Color family: purple
				if (!colorSecondary) {
					color = '#F6A9FF';
				} else {
					color = '#5609A9';
				}
				break;
			case 'PNE':
				// Color family: brown
				if (!colorSecondary) {
					color = '#a1887f';
				} else {
					color = '#4e342e';
				}
				break;
			case 'RED':
				// Color family: orange
				if (!colorSecondary) {
					color = '#FFC37D';
				} else {
					color = '#843E04';
				}
				break;
			case 'NOF':
				// Color family: black and white
				if (!colorSecondary) {
					color = '#000000';
				} else {
					color = '#FFFFFF';
				}
				break
			case 'NON':
				// Color family: lavender
				if (!colorSecondary) {
					color = '#D0BDF6';
				} else {
					color = '#6F44C7';
				}
				break;
			default:
				color = defaultColor;
				break;
		}
		return color;
	}
}