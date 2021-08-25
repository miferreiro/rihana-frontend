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

import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {Patient, SEX} from "../models/Patient";
import {PatientInfo} from "./entities/PatientInfo";

@Injectable()
export class PatientsService {

	constructor(private http: HttpClient) {
	}

	getPatient(id: string): Observable<Patient> {
		return this.http.get<PatientInfo>(`${environment.restApi}/patient/${id}`).pipe(
			map(this.mapPatientInfo.bind(this))
		);
	}

	private mapPatientInfo(patientInfo: PatientInfo): Patient {
		return {
			id: patientInfo.id,
			patientID: patientInfo.patientID,
			sex: SEX[patientInfo.sex],
			birthdate: patientInfo.birthdate
		};
	}
}