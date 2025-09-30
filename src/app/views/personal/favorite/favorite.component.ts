import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {ProductType} from "../../../../types/product.type";
import {CartService} from "../../../shared/services/cart.service";
import {ProductService} from "../../../shared/services/product.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  count: number = 1;
  countTemp: number = 1;
  countObjs: { id: string, url: string, count: number }[] = [];
  cartProducts: CartType | null = null;
  productData!: ProductType;
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService,
              private productService: ProductService,
              private _snackBar: MatSnackBar) {
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

            this.cartService.getCart()
              .subscribe((cartData: CartType | DefaultResponseType) => {
                if ((cartData as DefaultResponseType).error !== undefined) {
                  throw new Error((cartData as DefaultResponseType).message);
                }
                this.cartProducts = cartData as CartType;

                if (this.cartProducts && this.cartProducts.items && this.cartProducts.items.length > 0) {
                  this.products.forEach(item => {
                    for (let i = 0; i < this.cartProducts!.items.length; i++) {
                      if (this.cartProducts!.items[i].product.id === item.id) {
                        item.countInCart = this.cartProducts!.items[i].quantity;
                      }
                    }
                  })
                }
              })


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

  updateCount(id: string, value: number) {
    const objId = this.products.find(item => item.id === id)
    if (!objId) return;
    const existIndex = this.countObjs.findIndex(item => item.id === id);

    if (existIndex !== -1) {
      this.countObjs[existIndex].count = value;
    } else {
      this.countObjs.push({id: objId.id, url: objId.url, count: value})
    }

    if (this.cartProducts && this.cartProducts.items.find(item => item.product.id === id)) {
      this.cartService.updateCart(id, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.cartProducts = data as CartType;
        })
    }
  }

  addToCart(url: string): void {
    this.productService.getProduct(url)
      .subscribe(prodData => {
        this.productData = prodData;

        const existItem =  this.countObjs.find(item => item.url === url)
        if (existItem) {
          this.countTemp = existItem.count;
        }

        this.cartService.updateCart(this.productData.id, this.countTemp)
          .subscribe((data: CartType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            this.products.forEach(item => {
              if (item.id === this.productData.id) {
                item.countInCart = this.countTemp;
                this.cartProducts = data as CartType;
                this.countTemp = 1;
              }
            })
          })
      })
  }

  removeFromCart(id: string) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.products.forEach(item => {
          if (item.id === id) {
            item.countInCart = 0;
            this.cartProducts = data as CartType;
          }
        })
      })
  }


}
