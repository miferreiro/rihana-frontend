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

import {RequestedExploration, PerformedExploration} from "../../models/Report";

export interface NewReportInfo {
	type: string;
	completionDate: Date;
	reportNumber: string;
	applicant: string;
	priority: string;
	status: string;
	bed: string;
	requestedExplorations: RequestedExploration[];
	clinicalData: string;
	performedExplorations: PerformedExploration[];
	findings: string;
	conclusions: string;
}

export interface NewRequestedExplorationInfo {
	code: string;
	description: string;
	date: Date;
}

export interface NewPerformedExplorationInfo {
	code: string;
	description: string;
	date: Date;
	portable: string;
	surgery: string;
}