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

import {Injectable, Optional, SkipSelf} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LocalizationServiceConfig} from './localization-config.service';

/**
 * Class representing the translation service.
 */
@Injectable()
export class LocalizationService {
	private _localeId: string = 'gl'; // default
	private _localeIds: string[];
	/**
	 * @constructor
	 * @param {LocalizationService} singleton - the localization service
	 * @param {LocalizationServiceConfig} config - the localization config
	 * @param {TranslateService} translateService - the translate service
	 */
	constructor(
		@Optional() @SkipSelf() private singleton: LocalizationService,
		private config: LocalizationServiceConfig,
		private translateService: TranslateService
	) {
		if (this.singleton) {
			throw new Error(
				'LocalizationService is already provided by the root module'
			);
		}
		this._localeId = this.config.locale_id;
		this._localeIds = ["en", "es", "gl"];
	}

	/**
	 * Initializes the service.
	 * @returns {Promise<void>}
	 */
	public initService(): Promise<void> {
		// language code same as file name.
		this._localeId = localStorage.getItem('language') || 'gl';
		return this.useLanguage(this._localeId);
	}

	/**
	 * Gets the current locale id.
	 * @returns {string}
	 */
	public getCurrentLocaleId(): string {
		return this.translateService.getDefaultLang();
	}

	/**
	 * Gets the available locales ids.
	 * @returns {string[]}
	 */
	public getLocaleIds(): string[] {
		return this._localeIds;
	}

	/**
	 * Changes the selected language.
	 * @returns {Promise<void>}
	 */
	public useLanguage(lang: string): Promise<void> {
		this.translateService.setDefaultLang(lang);
		return this.translateService
				.use(lang)
				.toPromise()
				.catch(() => {
					throw new Error('LocalizationService.init failed');
				});
	}

	/**
	 * Gets the instant translated value of a key (or an array of keys).
	 * @param key
	 * @param interpolateParams
	 * @returns {string|any}
	 */
	public translate(key: string | string[], interpolateParams?: object): string {
		return this.translateService.instant(key, interpolateParams) as string;
	}
}