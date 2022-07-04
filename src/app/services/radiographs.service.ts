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

import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {concatMap, map} from "rxjs/operators";
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

	constructor(private http: HttpClient) {}

	public getRadiograph(id: string, source: boolean = false): Observable<Radiograph> {
		return this.http.get<RadiographInfo>(`${environment.restApi}/radiograph/${id}/metadata`).pipe(
			concatMap((radiographInfo: RadiographInfo) => {
				if(source) {
					return this.getRadiographContents(radiographInfo.id)
						.pipe(
							map(imageContent => {
								const radiograph = this.mapRadiographInfo(radiographInfo);
								radiograph.source = 'data:image/png;base64,' + imageContent;
								return radiograph;
							})
						);
				} else {
					return of(this.mapRadiographInfo(radiographInfo))
				}
			})
		);
	}

	public getRadiographContents(id: string): Observable<string> {
		return this.http.get(`${environment.restApi}/radiograph/${id}`, { responseType: 'arraybuffer' })
			.pipe(map(RadiographsService.arrayBufferToBase64));
	}

	private static arrayBufferToBase64(buffer: ArrayBuffer): string {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
		  binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
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