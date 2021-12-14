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
import {NgSelectModule} from '@ng-select/ng-select';
import {InternationalizationModule} from './modules/internationalization/internationalization.module';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NgxPaginationModule} from 'ngx-pagination';
import {NotificationModule} from './modules/notification/notification.module';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {ErrorNotificationHandler} from './modules/notification/handlers/error-notification.handler';
import {AuthenticationInterceptor} from './helpers/authentication.interceptor';

import {ActionsService} from './services/actions.service';
import {ExplorationsService} from './services/explorations.service';
import {PatientsService} from './services/patients.service';
import {RadiographsService} from './services/radiographs.service';
import {ReportsService} from './services/reports.service';
import {SignsService} from './services/signs.service';
import {SignTypesService} from './services/sign-types.service';

import {ActionComponent} from './components/action/action.component';
import {BarChartComponent} from './components/explorations/bar-chart/bar-chart.component';
import {DeleteConfirmationComponent} from './components/delete-confirmation/delete-confirmation.component';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {ImageAnnotatorComponent} from './components/image-annotator/image-annotator.component';
import {LoginComponent} from './components/login/login.component';
import {LocateSignsInImageDialogComponent} from './components/locate-signs-in-image-dialog/locate-signs-in-image-dialog.component';
import {RadiologyAnalysisComponent} from './components/radiology-analysis/radiology-analysis.component';
import {RadiographComponent} from './components/radiology-analysis/radiograph/radiograph.component';
import {ReportComponent} from './components/report/report.component';
import {SigntypeComponent} from './components/signtype/signtype.component';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {PieChartComponent} from './components/explorations/pie-chart/pie-chart.component';
import {ProfileComponent} from './components/profile/profile.component';
import {UserComponent} from './components/user/user.component';

import {LangPipe} from './pipes/lang.pipe';
import {PixelsToMmsPipe} from './pipes/pixels-to-mms.pipe';
import {BytesToHumanReadablePipe} from './pipes/bytes-to-human-readable.pipe';

import {DecimalPipe, registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeGl from '@angular/common/locales/gl';

import {ChartsModule} from 'ng2-charts';

import {NgxPanZoomModule} from 'ngx-panzoom';

import {ColorPickerModule} from '@iplab/ngx-color-picker';

import {Daterangepicker} from 'ng2-daterangepicker';

@NgModule({
	declarations: [
		AppComponent,
		ActionComponent,
		DeleteConfirmationComponent,
		ExplorationComponent,
		ExplorationsComponent,
		ImageAnnotatorComponent,
		LoginComponent,
		LocateSignsInImageDialogComponent,
		ProfileComponent,
		RadiologyAnalysisComponent,
		RadiographComponent,
		ReportComponent,
		SigntypeComponent,
		UserComponent,
		LangPipe,
		PixelsToMmsPipe,
		BytesToHumanReadablePipe,
		PagenotfoundComponent,
		PieChartComponent,
		BarChartComponent
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		BrowserAnimationsModule,
		ChartsModule,
		ColorPickerModule,
		Daterangepicker,
		FileUploadModule,
		FormsModule,
		HttpClientModule,
		NgxPanZoomModule,
		NgSelectModule,
		NotificationModule,
		NgxPaginationModule,
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
		ActionsService,
		ExplorationsService,
		PatientsService,
		RadiographsService,
		ReportsService,
		SignsService,
		SignTypesService,
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