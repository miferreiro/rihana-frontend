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

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'humanFileSize'
})
export class BytesToHumanReadablePipe implements PipeTransform {

	private units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];


	/**
	 * Format bytes as human-readable text.
	 *
	 * @param bytes Number of bytes.
	 * @param dp Number of decimal places to display.
	 *
	 * @return Formatted string.
	 */
	transform(bytes: number, dp = 2): string {
		const thresh = 1024;

		if (Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}

		let u = -1;
		const r = 10**dp;

		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < this.units.length - 1);

		return bytes.toFixed(dp) + ' ' + this.units[u];
	}
}
