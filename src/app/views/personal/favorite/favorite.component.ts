import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe({
          next: (data: FavoriteType[] | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }
            this.products = data as FavoriteType[];

          },
          error: (err: HttpErrorResponse) => {
            if (err.error && err.error.message) {
              this._snackBar.open(err.error.message);
              console.log(err.error.message);
            } else {
              this._snackBar.open('Не могу получить доступ к серверу');
              console.log('Не могу получить доступ к серверу');
            }
          }

        },
      )
  }

  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorites(id)
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            const error = data.message;
            throw new Error(error);
          }
          this.products = this.products.filter(item => item.id !== id);
        },
        error: (err: HttpErrorResponse) => {
          if (err.error && err.error.message) {
            this._snackBar.open(err.error.message);
            console.log(err.error.message);
          } else {
            this._snackBar.open('Не могу получить доступ к серверу');
            console.log('Не могу получить доступ к серверу');
          }
        }
      })
  }



}
