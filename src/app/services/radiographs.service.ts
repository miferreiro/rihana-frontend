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
import {RadiographInfo} from "./entities/RadiographInfo";
import {SignInfo} from "./entities/SignInfo";
import {SignLocationInfo} from "./entities/SignLocationInfo";
import {Radiograph} from "../models/Radiograph";
import {Sign} from "../models/Sign";
import {SignLocation} from "../models/SignLocation";

@Injectable({
	providedIn: 'root'
})
export class RadiographsService {

	constructor(private http: HttpClient) {
	}

	getRadiograph(id: string): Observable<Radiograph> {
		return this.http.get<RadiographInfo[]>(`${environment.restApi}/radiograph/${id}`).pipe(
			map(this.mapRadiographInfo.bind(this))
		);
	}

	private mapRadiographInfo(radiographInfo: RadiographInfo): Radiograph {
		return {
			id: radiographInfo.id,
			type: radiographInfo.type,
			source: radiographInfo.source,
			signs: radiographInfo.signs.map(sign => this.mapSignInfo(sign)),
			observations: radiographInfo.observations
		};
	}

	private mapSignInfo(sign: SignInfo): Sign {
		return {
			id: sign.id,
			type: sign.type,
			location: this.mapSignLocationInfo(sign.location),
			brightness: sign.brightness,
			contrast: sign.contrast,
			render: true
		}
	}

	private mapSignLocationInfo(signLocation: SignLocationInfo): SignLocation {
		if (signLocation == null) {
			return null;
		} else {
			return new SignLocation(signLocation.x, signLocation.y, signLocation.width, signLocation.height);
		}
	}
}