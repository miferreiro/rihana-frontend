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

import {Patient} from "./Patient";
import {Radiograph} from "./Radiograph";
import {Report} from "./Report";
import {Users} from "./Users";

export class Exploration {
	id: string;
	title: string;
	explorationDate: Date;
	source: Source;
	user: Users;
	patient: Patient;
	report: Report;
	radiographs: Radiograph[];
	deleted?: boolean;
}

export enum Source {
	SERGAS = 'SERGAS',
	PADCHEST = 'PADCHEST'
}