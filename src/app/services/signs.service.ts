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
import {Sign, SIGNTYPE} from "../models/Sign";
import { EnumUtils } from "../utils/enum.utils";
import {SignInfo} from "./entities/SignInfo";

@Injectable()
export class SignsService {

	constructor(private http: HttpClient) {
	}

	getSigns(): Observable<Sign[]> {
		return this.http.get<SignInfo[]>(`${environment.restApi}/sign`).pipe(
			map((signs) => signs.map(this.mapSignInfo.bind(this)))
		);
	}

	getSignsByUser(user: string): Observable<Sign[]> {
		return this.http.get<SignInfo[]>(`${environment.restApi}/sign/${user}`).pipe(
			map((signs) => signs.map(this.mapSignInfo.bind(this)))
		);
	}

	private mapSignInfo(signInfo: SignInfo): Sign {
		return {
			id: signInfo.id,
			type: SIGNTYPE[EnumUtils.findKeyForValue(SIGNTYPE, signInfo.type.name)],
			location: signInfo.location,
			brightness: signInfo.brightness,
			contrast: signInfo.contrast,
			render: true
		};
	}
}