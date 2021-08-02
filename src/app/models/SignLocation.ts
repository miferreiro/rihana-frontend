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

export class SignLocation {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	) {}

	public static areEqual(locationA: SignLocation, locationB: SignLocation): boolean {
		return locationA === locationB || (Boolean(locationA) && Boolean(locationB) && locationA.isEqualTo(locationB));
	}

	public isEqualTo(location: SignLocation): boolean {
		if (location === this) {
			return true;
		} else if (!Boolean(location)) {
			return false;
		} else {
			const regularThis = this.regularize();
			const regularLocation = location.regularize();

			return regularThis.x === regularLocation.x
			&& regularThis.y === regularLocation.y
			&& regularThis.width === regularLocation.width
			&& regularThis.height === regularLocation.height;
		}
	}

	public regularize(): SignLocation {
		return new SignLocation(
			Math.min(this.x, this.x + this.width),
			Math.min(this.y, this.y + this.height),
			Math.abs(this.width),
			Math.abs(this.height)
		);
	}

	public isValid(): boolean {
		return this.width !== 0 && this.height !== 0;
	}

	public area(): number {
		return this.width * this.height;
	}
}