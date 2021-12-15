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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/authGuard';
import {ActionComponent} from './components/action/action.component';
import {ExplorationComponent} from './components/exploration/exploration.component';
import {ExplorationsComponent} from './components/explorations/explorations.component';
import {FunctionalityComponent} from './components/functionality/functionality.component';
import {LoginComponent} from './components/login/login.component';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {ProfileComponent} from './components/profile/profile.component';
import {RoleComponent} from './components/role/role.component';
import {SigntypeComponent} from './components/signtype/signtype.component';
import {UserComponent} from './components/user/user.component';

const routes: Routes = [
	{
		path: 'roles', component: RoleComponent, canActivate: [AuthGuard]
	},
	{
		path: 'functionalities', component: FunctionalityComponent, canActivate: [AuthGuard]
	},
	{
		path: 'actions', component: ActionComponent, canActivate: [AuthGuard]
	},
	{
		path: 'singtypes', component: SigntypeComponent, canActivate: [AuthGuard]
	},
	{
		path: 'users', component: UserComponent, canActivate: [AuthGuard]
	},
	{
		path: 'explorations', component: ExplorationsComponent, canActivate: [AuthGuard]
	},
	{
		path: 'exploration', component: ExplorationComponent, canActivate: [AuthGuard]
	},
	{
		path: 'login', component: LoginComponent
	},
	{
		path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]
	},
	{
		path: '', redirectTo: 'explorations', pathMatch: 'full'
	},
	{
		path: '**', pathMatch: 'full', redirectTo: 'PageNotFound',
	},
	{
		path: 'PageNotFound', component: PagenotfoundComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			useHash: false,
			anchorScrolling: 'enabled'
		})
	],
  	exports: [RouterModule]
})
export class AppRoutingModule { }