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

import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FileUploadModule} from '@iplab/ngx-file-upload';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NotificationModule} from './modules/notification/notification.module';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {ErrorNotificationHandler} from './modules/notification/handlers/error-notification.handler';
import {LoginComponent} from './components/login/login.component';
import {AuthenticationInterceptor} from './helpers/authentication.interceptor';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {ReportComponent} from './components/report/report.component';

@NgModule({
	declarations: [
		AppComponent,
  		LoginComponent,
		ExplorationsComponent,
  		ExplorationComponent,
		ReportComponent
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
		}
	],
  	bootstrap: [AppComponent]
})
export class AppModule { }