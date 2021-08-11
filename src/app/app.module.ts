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

import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ErrorHandler, NgModule} from '@angular/core';
import {FileUploadModule} from '@iplab/ngx-file-upload';
import {FormsModule} from '@angular/forms';
import {InternationalizationModule} from './modules/internationalization/internationalization.module';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NotificationModule} from './modules/notification/notification.module';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {ErrorNotificationHandler} from './modules/notification/handlers/error-notification.handler';
import {AuthenticationInterceptor} from './helpers/authentication.interceptor';

import {ExplorationComponent} from './components/exploration/exploration.component';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {ImageAnnotatorComponent} from './components/image-annotator/image-annotator.component';
import {LoginComponent} from './components/login/login.component';
import {LocateSignsInImageDialogComponent} from './components/locate-signs-in-image-dialog/locate-signs-in-image-dialog.component';
import {RadiologyAnalysisComponent} from './components/radiology-analysis/radiology-analysis.component';
import {RadiographyComponent} from './components/radiology-analysis/radiography/radiography.component';
import {ReportComponent} from './components/report/report.component';

import {LangPipe} from './pipes/lang.pipe';
import {PixelsToMmsPipe} from './pipes/pixels-to-mms.pipe';
import {BytesToHumanReadablePipe} from './pipes/bytes-to-human-readable.pipe';

import {DecimalPipe, registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeGl from '@angular/common/locales/gl';

@NgModule({
	declarations: [
		AppComponent,
		ExplorationComponent,
		ExplorationsComponent,
		ImageAnnotatorComponent,
		LoginComponent,
		LocateSignsInImageDialogComponent,
		RadiologyAnalysisComponent,
		RadiographyComponent,
		ReportComponent,
		LangPipe,
		PixelsToMmsPipe,
		BytesToHumanReadablePipe
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		BrowserAnimationsModule,
		FileUploadModule,
		FormsModule,
		HttpClientModule,
		NotificationModule,
		SimpleNotificationsModule.forRoot({
			timeOut: 10000,
			preventDuplicates: true,
			pauseOnHover: true,
			clickToClose: true
		}),
		InternationalizationModule.forRoot({locale_id: 'gl'}),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			},
			compiler: {
				provide: TranslateCompiler,
				useClass: TranslateMessageFormatCompiler
			}
		})
	],
	providers: [
		{
			provide: ErrorHandler,
			useClass: ErrorNotificationHandler
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthenticationInterceptor, multi: true
		},
		DecimalPipe,
		PixelsToMmsPipe
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

/**
* The http loader factory : Loads the files from define path.
* @param {HttpClient} http
* @returns {TranslateHttpLoader}
* @constructor
*/
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

registerLocaleData(localeEs)
registerLocaleData(localeGl)