import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../services/favorite.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
  @Input() isLight: boolean = false;
  // isInCart: boolean = false;
  @Input() countInCart: number | undefined = 0;

  isLogged: boolean = false;

  constructor(private cartService: CartService,
              private favoriteService: FavoriteService,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }

    this.isLogged = this.authService.getIsLoggedIn();
    this.authService.isLogged$.subscribe((isLogged: boolean) => {
      this.isLogged = isLogged;
    })
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
        this.count = 1;
      })
  }

  updateCount(value: number) {
    console.log(value);
    this.count = value;

    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.countInCart = this.count;
        })
    }
  }


  updateFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавление в избранное необходимо авторизоваться');
      return;
    }

    if (this.product.isInFavorite) {
      this.favoriteService.removeFavorites(this.product.id)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              const error = data.message;
              throw new Error(error);
            }
            this.product.isInFavorite = false;
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
    } else {
      this.favoriteService.addFavorites(this.product.id)
        .subscribe({
            next: (data: FavoriteType | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                const error = (data as DefaultResponseType).message;
                throw new Error(error);
              }
              this.product.isInFavorite = true;
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
          }
        )
    }
  }

  navigate() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url])
    }
  }

}
