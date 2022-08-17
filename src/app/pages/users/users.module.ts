import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { LayoutModule } from 'src/app/layout/layout.module';

import { UsersRoutingModule } from './users-routing.module';

import { UsersCreatePageComponent } from './users-create-page/users-create-page.component';
import { UsersListPageComponent } from './users-list-page/users-list-page.component';

@NgModule({
  declarations: [
    UsersCreatePageComponent,
    UsersListPageComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    LayoutModule,
    UsersRoutingModule,
    ReactiveFormsModule,
  ],
})
export class UsersModule { }
