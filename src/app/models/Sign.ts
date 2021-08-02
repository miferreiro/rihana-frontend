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

export function assignColorTypeSign(signType: SIGNTYPE): string {
	let color: string;
	switch (signType) {
		case SIGNTYPE.CARDIOMEGALY:
			color = 'red';
			break;
		case SIGNTYPE.CONDENSATION:
			color = 'lightgreen';
			break;
		case SIGNTYPE.MASSES:
			color = 'lightblue';
			break;
		case SIGNTYPE.NODULES:
			color = 'darkblue';
			break;
		case SIGNTYPE.PLEURAL_EFFUSION:
			color = 'purple';
			break;
		case SIGNTYPE.PNEUMOTHORAX:
			color = 'fuchsia';
			break;
		case SIGNTYPE.REDISTRIBUTION:
			color = 'orange';
			break;
		default:
			color = 'yellow';
			break;
	}
	return color;
}