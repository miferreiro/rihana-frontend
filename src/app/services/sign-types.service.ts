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
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {SignType} from "../models/SignType";
import {SignInfo} from "./entities/SignInfo";
import {SignTypeInfo} from "./entities/SignTypeInfo";

@Injectable({
	providedIn: 'root'
})
export class SignTypesService {

	private defaultSign: string = "NOP";

	constructor(private http: HttpClient) {}

	public getDefaultSign(): string {
		return this.defaultSign;
	}

	public getSignTypes(): Observable<SignType[]> {
		return this.http.get<SignInfo[]>(`${environment.restApi}/sign/type`).pipe(
			map((signTypes) => signTypes.map(this.mapSignTypeInfo.bind(this)))
		);
	}

	public create(signType: SignType): Observable<SignType> {
		const signTypeInfo = this.toSignTypeInfo(signType);

		return this.http.post<SignTypeInfo>(`${environment.restApi}/sign/type`, signTypeInfo).pipe(
			map(this.mapSignTypeInfo.bind(this))
		);
	}

	public editSignType(signType: SignType): Observable<SignType> {
		const signTypeInfo = this.toSignTypeInfo(signType);
		return this.http.put<SignTypeInfo>(`${environment.restApi}/sign/type/${signType.code}`, signTypeInfo).pipe(
			map(this.mapSignTypeInfo.bind(this))
		);
	}

	public deleteSignType(code: string) {
		return this.http.delete(`${environment.restApi}/sign/type/${code}`);
	}

	private toSignTypeInfo(signType: SignType): SignTypeInfo {
		return {
			code: signType.code,
			name: signType.name,
			description: signType.description,
			target: signType.target,
			primaryColor: signType.primaryColor,
			secondaryColor: signType.secondaryColor
		};
	}

	private mapSignTypeInfo(signTypeInfo: SignTypeInfo): SignType {
		return  {
			code: signTypeInfo.code,
			name: signTypeInfo.name,
			description: signTypeInfo.description,
			target: signTypeInfo.target,
			primaryColor: signTypeInfo.primaryColor,
			secondaryColor: signTypeInfo.secondaryColor
		};
	}
}
