import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OrganizationsApi } from 'src/app/api/organizations';
import { AuthService } from 'src/app/services/auth.service';
import { IItem } from 'src/app/interfaces/item';

@Component({
  selector: '[app-page-menu]',
  templateUrl: './page-menu.component.html',
  styleUrls: [],
})
export class PageMenuComponent implements OnInit {
  organization: IItem|null = null;

  constructor (
    private authService: AuthService,
    private organizationsApi: OrganizationsApi,
    private router: Router,
  ) { }

  ngOnInit (): void {
    this.organizationsApi.get(this.organizationId)
      .subscribe((result: IItem) => {
        this.organization = result;
      });
  }

  get displayName () {
    const tokenPayload = this.authService.getTokenPayload();
    if (tokenPayload.firstname && tokenPayload.lastname) {
      return tokenPayload.firstname + ' ' + tokenPayload.lastname;
    } else {
      return $localize `Anonymous`;
    }
  }

  get organizationId () {
    const tokenPayload = this.authService.getTokenPayload();
    if (tokenPayload.organization_id) {
      return tokenPayload.organization_id;
    } else {
      return '';
    }
  }

  logout () {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
