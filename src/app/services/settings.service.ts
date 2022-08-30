import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { map, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IProperty } from 'src/app/interfaces/property';
import { IType } from 'src/app/interfaces/type';

import { AuthService } from 'src/app/services/auth.service';

interface Configuration {
  backendUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private configuration: Configuration = {
    backendUrl: '/api',
  };

  private propertiesIndexedByInternalname: {[key: string]: IProperty} = {};
  private typesIndexedByInternalname: {[key: string]: IType} = {};

  constructor (
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  public async loadConfiguration () {
    await this.http.get<Configuration>('config.json')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            // The configuration file is optional, so it's safe to ignore (404)
            // error here.
            return of({});
          } else {
            return throwError(() => new Error(error.error.message));
          }
        }),
      ).pipe(map((configuration: Configuration | {}) => {
        // Merge the default configuration with the configuration from the server.
        this.configuration = {
          ...this.configuration,
          ...configuration,
        };
      }))
      .toPromise();

    if (this.authService.isLoggedIn()) {
      await this.loadTypes();
    }
  }

  public loadTypes () {
    return this.http.get<IType[]>(this.configuration.backendUrl + '/v1/config/types', {
      headers: {
        Authorization: 'Bearer ' + this.authService.getToken(),
      },
    })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = error.message;
          if (error.error.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        }),
      ).pipe(map((types: IType[]) => {
        this.typesIndexedByInternalname = {};
        this.propertiesIndexedByInternalname = {};

        types.forEach((type: IType) => {
          this.typesIndexedByInternalname[type.internalname] = type;

          type.properties.forEach((property: IProperty) => {
            this.propertiesIndexedByInternalname[property.internalname] = property;
          });
        });
      }))
      .toPromise();
  }

  get backendUrl () {
    return this.configuration.backendUrl;
  }

  public getTypeIdByInternalname (internalname: string) {
    return this.typesIndexedByInternalname[internalname]?.id;
  }

  public getPropertyIdByInternalname (internalname: string) {
    return this.propertiesIndexedByInternalname[internalname]?.id;
  }
}
