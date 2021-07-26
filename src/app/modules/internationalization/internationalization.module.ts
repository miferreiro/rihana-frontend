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

import {APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocalizationService} from './localization.service';
import {LocalizationServiceConfig} from './localization-config.service';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
	declarations: [],
	imports: [CommonModule, HttpClientModule, TranslateModule.forChild()],
	exports: [TranslateModule]
})
export class InternationalizationModule {
	public static forRoot(config: any): ModuleWithProviders<InternationalizationModule> {
		return {
			ngModule: InternationalizationModule,
			providers: [
			{
				provide: APP_INITIALIZER,
				useFactory: initLocalizationService,
				deps: [LocalizationService],
				multi: true
			},
			LocalizationService,
			{
				provide: LOCALE_ID,
				deps: [LocalizationService],
				useFactory: (localizationService: LocalizationService) => localizationService.getCurrentLocaleId()
			},
			{
				provide: LocalizationServiceConfig,
				useValue: config
			}]
		};
	}
}
/**
  * Initializes the localization service.
  * @param {LocalizationService} service
  * @returns {() => Promise<void>}
  */
export function initLocalizationService(service: LocalizationService) {
	return () => service.initService();
}